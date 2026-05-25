import { AppLayout } from "@/components/layout/AppLayout";
  import { useListTransactions } from "@workspace/api-client-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import { formatRupiah } from "@/lib/utils";
  import { ArrowDownCircle, ArrowUpCircle, RotateCw, Gift, Wallet, TrendingUp } from "lucide-react";

  function TypeBadge({ type }: { type: string }) {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      deposit:  { label: "Deposit",  color: "text-green-400 bg-green-400/10 border-green-400/30",   icon: <ArrowDownCircle className="w-3 h-3" /> },
      order:    { label: "Order",    color: "text-red-400 bg-red-400/10 border-red-400/30",          icon: <ArrowUpCircle className="w-3 h-3" /> },
      refund:   { label: "Refund",   color: "text-blue-400 bg-blue-400/10 border-blue-400/30",       icon: <RotateCw className="w-3 h-3" /> },
      referral: { label: "Referral", color: "text-purple-400 bg-purple-400/10 border-purple-400/30", icon: <Gift className="w-3 h-3" /> },
    };
    const s = map[type] ?? { label: type, color: "text-gray-400 bg-gray-400/10 border-gray-400/30", icon: <Wallet className="w-3 h-3" /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }

  export default function Transactions() {
    const { data: transactions, isLoading } = useListTransactions({});

    return (
      <AppLayout>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Riwayat Transaksi</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Semua mutasi saldo akun kamu</p>
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : !(transactions as any[] | undefined)?.length ? (
              <div className="p-10 text-center text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <>
                <div className="hidden md:grid grid-cols-[120px_1fr_140px_140px_140px] gap-3 px-4 py-2.5 border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div>Tipe</div><div>Keterangan</div><div className="text-right">Jumlah</div><div className="text-right">Saldo Akhir</div><div className="text-right">Tanggal</div>
                </div>
                <div className="divide-y divide-white/5">
                  {(transactions as any[]).map((trx: any) => (
                    <div key={trx.id} className="p-4 hover:bg-white/5 transition-colors">
                      {/* Mobile */}
                      <div className="md:hidden flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${trx.amount > 0 ? "bg-green-400/10" : "bg-red-400/10"}`}>
                            {trx.amount > 0 ? <ArrowDownCircle className="w-4 h-4 text-green-400" /> : <ArrowUpCircle className="w-4 h-4 text-red-400" />}
                          </div>
                          <div className="min-w-0">
                            <TypeBadge type={trx.type} />
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">{trx.description}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-sm font-bold ${trx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            {trx.amount > 0 ? "+" : ""}{formatRupiah(trx.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">{formatRupiah(trx.balance)}</div>
                        </div>
                      </div>
                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-[120px_1fr_140px_140px_140px] gap-3 items-center">
                        <TypeBadge type={trx.type} />
                        <div className="text-sm truncate text-muted-foreground">{trx.description}</div>
                        <div className={`text-sm font-semibold text-right ${trx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {trx.amount > 0 ? "+" : ""}{formatRupiah(trx.amount)}
                        </div>
                        <div className="text-sm text-right text-muted-foreground">{formatRupiah(trx.balance)}</div>
                        <div className="text-xs text-right text-muted-foreground">
                          {new Date(trx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }
  