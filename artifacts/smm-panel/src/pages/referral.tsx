import { AppLayout } from "@/components/layout/AppLayout";
import { useGetReferralInfo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { Users, Coins } from "lucide-react";

export default function Referral() {
  const { data: info, isLoading } = useGetReferralInfo();

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Referral System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{info?.totalReferrals || 0}</div>}
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <Coins className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{formatRupiah(info?.totalEarnings || 0)}</div>}
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full max-w-sm" />
            ) : (
              <div className="flex gap-4 items-center">
                <code className="px-4 py-2 bg-muted rounded-md border border-border text-lg font-mono">
                  {info?.code || "N/A"}
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
