import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateDeposit, useListDeposits, useGetDeposit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { QrCode, Copy, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Deposit() {
  const [amount, setAmount] = useState<string>("");
  const [activeDepositId, setActiveDepositId] = useState<number | null>(null);
  
  const createDepositMutation = useCreateDeposit();
  const { data: history, refetch: refetchHistory } = useListDeposits();
  
  // Polling for active deposit status
  const { data: activeDeposit } = useGetDeposit(activeDepositId as number, { 
    query: { 
      enabled: !!activeDepositId, 
      refetchInterval: activeDepositId ? 5000 : false,
    } 
  });

  useEffect(() => {
    if (activeDeposit?.status === 'completed') {
      toast.success("Deposit successful! Balance added.");
      setActiveDepositId(null);
      refetchHistory();
    } else if (activeDeposit?.status === 'failed' || activeDeposit?.status === 'expired') {
      toast.error(`Deposit ${activeDeposit.status}`);
      setActiveDepositId(null);
      refetchHistory();
    }
  }, [activeDeposit?.status, refetchHistory]);

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  const handleCreateDeposit = () => {
    const numAmount = parseInt(amount.replace(/\D/g, ''));
    if (!numAmount || numAmount < 10000) {
      toast.error("Minimum deposit is Rp 10.000");
      return;
    }

    createDepositMutation.mutate({
      data: { amount: numAmount, method: "qris" }
    }, {
      onSuccess: (res) => {
        toast.success("Deposit created");
        setActiveDepositId(res.id);
        setAmount("");
        refetchHistory();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create deposit");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-display">Deposit Funds</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="text-primary" /> Auto Deposit QRIS
              </CardTitle>
              <CardDescription>Instant balance update 24/7</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!activeDepositId ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <Input 
                        type="text" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10000"
                        className="pl-9 bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map(amt => (
                      <Button 
                        key={amt} 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAmount(amt.toString())}
                        className="bg-muted/30 border-border/50 text-xs"
                      >
                        {formatRupiah(amt).replace('Rp', '')}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    className="w-full neon-glow mt-4" 
                    onClick={handleCreateDeposit}
                    disabled={createDepositMutation.isPending}
                  >
                    {createDepositMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Deposit
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">Please pay exactly</p>
                    <p className="text-3xl font-bold text-primary neon-text">{formatRupiah(activeDeposit?.amount || 0)}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl border-4 border-primary/20 shadow-xl shadow-primary/10">
                    <QrCode className="w-48 h-48 text-black" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-yellow-500 font-medium bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>Waiting for payment...</span>
                  </div>

                  <Button variant="outline" onClick={() => setActiveDepositId(null)} className="w-full text-muted-foreground">
                    Cancel / Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history?.slice(0, 5).map(dep => (
                  <div key={dep.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div>
                      <div className="font-medium">{formatRupiah(dep.amount)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleString()}</div>
                    </div>
                    <Badge variant="outline" className={
                      dep.status === 'completed' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                      dep.status === 'pending' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                      'text-red-500 border-red-500/30 bg-red-500/10'
                    }>
                      {dep.status}
                    </Badge>
                  </div>
                ))}
                {!history?.length && (
                  <div className="text-center py-8 text-muted-foreground">No deposit history</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
