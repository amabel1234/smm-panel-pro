import { useState, useEffect } from "react";
  import { AppLayout } from "@/components/layout/AppLayout";
  import { useCreateDeposit, useListDeposits, useGetDeposit } from "@workspace/api-client-react";
  import { formatRupiah } from "@/lib/utils";
  import { toast } from "sonner";
  import { QrCode, Copy, Loader2, CheckCircle2, Clock, XCircle, CreditCard, Wallet, TrendingUp, ArrowDownCircle } from "lucide-react";

  const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending:   { label: "Menunggu",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: <Clock className="w-3 h-3" /> },
      completed: { label: "Berhasil",  color: "text-green-400 bg-green-400/10 border-green-400/30",   icon: <CheckCircle2 className="w-3 h-3" /> },
      failed:    { label: "Gagal",     color: "text-red-400 bg-red-400/10 border-red-400/30",          icon: <XCircle className="w-3 h-3" /> },
      expired:   { label: "Kedaluarsa", color: "text-gray-400 bg-gray-400/10 border-gray-400/30",     icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] ?? map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }

  export default function Deposit() {
    const [amount, setAmount] = useState<string>("");
    const [activeDepositId, setActiveDepositId] = useState<number | null>(null);

    const createMutation = useCreateDeposit();
    const { data: history, refetch: refetchHistory } = useListDeposits();
    const { data: activeDeposit } = useGetDeposit(activeDepositId as number, {
      query: { enabled: !!activeDepositId, refetchInterval: activeDepositId ? 5000 : false }
    });

    useEffect(() => {
      if (!activeDeposit) return;
      if (activeDeposit.status === "completed") {
        toast.success("Deposit berhasil! Saldo telah ditambahkan.");
        setActiveDepositId(null);
        refetchHistory();
      } else if (activeDeposit.status === "failed" || activeDeposit.status === "expired") {
        toast.error("Deposit " + (activeDeposit.status === "failed" ? "gagal" : "kedaluarsa"));
        setActiveDepositId(null);
        refetchHistory();
      }
    }, [activeDeposit?.status]);

    const numericAmount = parseInt(amount.replace(/\D/g, "") || "0");

    const handleCreate = () => {
      if (!numericAmount || numericAmount < 10000) {
        toast.error("Minimum deposit Rp 10.000");
        return;
      }
      createMutation.mutate({ data: { amount: numericAmount, method: "qris" } }, {
        onSuccess: (res) => {
          toast.success("Deposit dibuat, scan QR untuk membayar");
          setActiveDepositId(res.id);
          setAmount("");
          refetchHistory();
        },
        onError: (err: any) => toast.error(err?.message || "Gagal membuat deposit"),
      });
    };

    const copyText = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Disalin ke clipboard");
    };

    return (
      <AppLayout>
        <div className="min-h-screen space-y-6 pb-10">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center neon-glow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Top Up Saldo</h1>
              <p className="text-muted-foreground text-sm">Isi saldo untuk mulai order layanan</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: TrendingUp, label: "Min. Deposit", value: "Rp 10.000", color: "text-blue-400" },
              { icon: CheckCircle2, label: "Proses", value: "Instan", color: "text-green-400" },
              { icon: QrCode, label: "Metode", value: "QRIS", color: "text-purple-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-3 border border-white/5 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-sm font-semibold mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form deposit */}
            <div className="glass rounded-2xl border border-white/10 p-5 space-y-5">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-semibold">Auto Deposit QRIS</h2>
                  <p className="text-xs text-muted-foreground">Update saldo otomatis 24/7</p>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nominal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">Rp</span>
                  <input
                    type="text"
                    value={numericAmount ? numericAmount.toLocaleString("id-ID") : ""}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-lg font-semibold transition-colors"
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105 ${
                      numericAmount === a
                        ? "gradient-bg text-white border-transparent neon-glow-sm"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {(a / 1000).toFixed(0)}.000
                  </button>
                ))}
              </div>

              {/* Total */}
              {numericAmount >= 10000 && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Transfer</span>
                  <span className="font-bold text-primary">{formatRupiah(numericAmount)}</span>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || numericAmount < 10000}
                className="w-full py-3 rounded-xl shimmer-btn text-white font-semibold neon-glow hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><QrCode className="w-4 h-4" /> Buat Deposit</>}
              </button>
            </div>

            {/* Active deposit QR */}
            {activeDeposit && activeDeposit.status === "pending" && (
              <div className="glass rounded-2xl border border-primary/30 p-5 space-y-4 neon-glow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Scan QR Code</h2>
                  <StatusBadge status="pending" />
                </div>
                {activeDeposit.qrCode && (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-xl">
                      <img src={activeDeposit.qrCode} alt="QR Code" className="w-48 h-48 object-contain" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nominal</span>
                    <span className="font-bold text-primary">{formatRupiah(activeDeposit.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batas Waktu</span>
                    <span className="text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3" /> 15 menit</span>
                  </div>
                </div>
                {activeDeposit.paymentCode && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Kode Pembayaran</div>
                      <div className="font-mono text-sm font-semibold">{activeDeposit.paymentCode}</div>
                    </div>
                    <button onClick={() => copyText(activeDeposit.paymentCode!)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-center text-muted-foreground">Saldo akan otomatis bertambah setelah pembayaran dikonfirmasi</p>
              </div>
            )}

            {/* Info jika tidak ada active deposit */}
            {!activeDeposit && (
              <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
                <h2 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Cara Deposit</h2>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Masukkan nominal deposit minimal Rp 10.000" },
                    { step: "2", text: "Klik tombol Buat Deposit" },
                    { step: "3", text: "Scan QR Code dengan aplikasi dompet digital kamu" },
                    { step: "4", text: "Saldo otomatis bertambah setelah pembayaran dikonfirmasi" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs text-white font-bold shrink-0 mt-0.5">{s.step}</div>
                      <p className="text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-green-400/5 border border-green-400/20 p-3">
                  <p className="text-xs text-green-400 font-medium">✓ Mendukung GoPay, OVO, DANA, ShopeePay, dan semua QRIS</p>
                </div>
              </div>
            )}
          </div>

          {/* Riwayat deposit */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Riwayat Deposit</h2>
            </div>
            {!history || history.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <QrCode className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada riwayat deposit</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((d: any) => (
                  <div key={d.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <QrCode className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{formatRupiah(d.amount)}</div>
                        <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }
  