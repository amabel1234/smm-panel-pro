import { AppLayout } from "@/components/layout/AppLayout";
  import { useListOrders, useRefillOrder } from "@workspace/api-client-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import { formatRupiah } from "@/lib/utils";
  import { useState } from "react";
  import { RotateCw, ExternalLink, Clock, CheckCircle2, Loader2, XCircle, Activity, ShoppingCart, Copy } from "lucide-react";
  import { toast } from "sonner";

  const STATUS_TABS = [
    { value: "",            label: "Semua",    color: "text-foreground" },
    { value: "pending",     label: "Menunggu", color: "text-yellow-400" },
    { value: "processing",  label: "Diproses", color: "text-blue-400" },
    { value: "completed",   label: "Selesai",  color: "text-green-400" },
    { value: "partial",     label: "Parsial",  color: "text-orange-400" },
    { value: "cancelled",   label: "Dibatal",  color: "text-red-400" },
  ];

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      completed:  { label: "Selesai",  color: "text-green-400 bg-green-400/10 border-green-400/30",  icon: <CheckCircle2 className="w-3 h-3" /> },
      processing: { label: "Diproses", color: "text-blue-400 bg-blue-400/10 border-blue-400/30",    icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      pending:    { label: "Menunggu", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: <Clock className="w-3 h-3" /> },
      partial:    { label: "Parsial",  color: "text-orange-400 bg-orange-400/10 border-orange-400/30", icon: <Activity className="w-3 h-3" /> },
      cancelled:  { label: "Dibatal",  color: "text-red-400 bg-red-400/10 border-red-400/30",        icon: <XCircle className="w-3 h-3" /> },
      refunded:   { label: "Refund",   color: "text-gray-400 bg-gray-400/10 border-gray-400/30",     icon: <RotateCw className="w-3 h-3" /> },
    };
    const s = map[status] ?? map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }

  export default function Orders() {
    const [status, setStatus] = useState<string>("");
    const { data, isLoading } = useListOrders({ status: status || undefined }, { query: { refetchInterval: 30000 } as any });
    const refillMutation = useRefillOrder();

    const handleRefill = (id: number) => {
      refillMutation.mutate({ id }, {
        onSuccess: () => toast.success("Permintaan refill dikirim!"),
        onError: (err: any) => toast.error(err?.message || "Gagal meminta refill"),
      });
    };

    const copyLink = (link: string) => {
      navigator.clipboard.writeText(link);
      toast.success("Link disalin!");
    };

    return (
      <AppLayout>
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold font-display">Riwayat Order</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Pantau semua ordermu di sini</p>
          </div>

          {/* Status filter */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  status === tab.value
                    ? "gradient-bg text-white border-transparent"
                    : "glass border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : !data?.orders?.length ? (
              <div className="p-10 text-center text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Tidak ada order {status ? `dengan status "${STATUS_TABS.find(t=>t.value===status)?.label}"` : ""}</p>
              </div>
            ) : (
              <>
                {/* Header tabel */}
                <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_80px_80px] gap-3 px-4 py-2.5 border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div>ID</div>
                  <div>Layanan</div>
                  <div>Harga</div>
                  <div>Qty</div>
                  <div>Status</div>
                  <div>Aksi</div>
                </div>
                <div className="divide-y divide-white/5">
                  {data.orders.map((order: any) => (
                    <div key={order.id} className="p-4 hover:bg-white/5 transition-colors">
                      {/* Mobile layout */}
                      <div className="md:hidden space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-muted-foreground font-mono">#{order.id}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <div className="text-sm font-medium line-clamp-1">{order.serviceName}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold">{formatRupiah(order.charge)}</div>
                            <div className="text-xs text-muted-foreground">{(order.quantity || 0).toLocaleString("id-ID")} pcs</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-xs text-muted-foreground truncate">{order.link}</div>
                          <button onClick={() => copyLink(order.link)} className="p-1 rounded hover:bg-white/10"><Copy className="w-3 h-3" /></button>
                          <a href={order.link} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-white/10"><ExternalLink className="w-3 h-3" /></a>
                          {order.status === "partial" && (
                            <button onClick={() => handleRefill(order.id)} className="p-1 rounded hover:bg-white/10 text-blue-400" title="Refill">
                              <RotateCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_80px_80px] gap-3 items-center">
                        <div className="text-xs text-muted-foreground font-mono">#{order.id}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium line-clamp-1">{order.serviceName}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{order.link}</span>
                            <button onClick={() => copyLink(order.link)} className="p-0.5 rounded hover:bg-white/10 shrink-0"><Copy className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{formatRupiah(order.charge)}</div>
                        <div className="text-sm text-muted-foreground">{(order.quantity || 0).toLocaleString("id-ID")}</div>
                        <div><StatusBadge status={order.status} /></div>
                        <div className="flex items-center gap-1">
                          <a href={order.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Buka link">
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </a>
                          {order.status === "partial" && (
                            <button onClick={() => handleRefill(order.id)} className="p-1.5 rounded-lg hover:bg-blue-400/10 text-blue-400 transition-colors" title="Refill">
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
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
  