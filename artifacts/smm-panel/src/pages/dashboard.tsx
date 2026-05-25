import { AppLayout } from "@/components/layout/AppLayout";
  import { useGetDashboardStats, useGetRecentOrders } from "@workspace/api-client-react";
  import { Wallet, ShoppingCart, Activity, TrendingUp, Plus, Clock, CheckCircle2, XCircle, Loader2, ArrowRight, Zap } from "lucide-react";
  import { formatRupiah } from "@/lib/utils";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Link } from "wouter";
  import { useAuth } from "@/contexts/AuthContext";

  function StatCard({ icon: Icon, label, value, color, loading, href }: any) {
    const inner = (
      <div className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        {loading ? <Skeleton className="h-7 w-24" /> : (
          <div className="text-xl font-bold font-display">{value}</div>
        )}
      </div>
    );
    return href ? <Link href={href}><div className="cursor-pointer hover:scale-[1.02] transition-transform">{inner}</div></Link> : inner;
  }

  function StatusIcon({ status }: { status: string }) {
    const map: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      completed:  { icon: <CheckCircle2 className="w-3 h-3" />, color: "text-green-400 bg-green-400/10",  label: "Selesai" },
      processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, color: "text-blue-400 bg-blue-400/10",   label: "Diproses" },
      pending:    { icon: <Clock className="w-3 h-3" />,         color: "text-yellow-400 bg-yellow-400/10", label: "Menunggu" },
      partial:    { icon: <Activity className="w-3 h-3" />,      color: "text-orange-400 bg-orange-400/10", label: "Parsial" },
      cancelled:  { icon: <XCircle className="w-3 h-3" />,       color: "text-red-400 bg-red-400/10",       label: "Dibatal" },
    };
    const s = map[status] ?? map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }

  export default function Dashboard() {
    const { user } = useAuth();
    const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
    const { data: recent, isLoading: loadingOrders } = useGetRecentOrders();

    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">
                Halo, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Selamat datang kembali di SMM Pro</p>
            </div>
            <Link href="/services">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl shimmer-btn text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Buat Order
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Wallet}       label="Saldo"          value={formatRupiah(stats?.balance || 0)}       color="gradient-bg"             loading={loadingStats} href="/deposit" />
            <StatCard icon={ShoppingCart} label="Total Order"    value={stats?.totalOrders || 0}                 color="bg-blue-500"             loading={loadingStats} />
            <StatCard icon={Activity}     label="Order Aktif"    value={stats?.activeOrders || 0}                color="bg-yellow-500"           loading={loadingStats} href="/orders" />
            <StatCard icon={TrendingUp}   label="Total Deposit"  value={formatRupiah(stats?.totalDeposited || 0)} color="bg-green-500"            loading={loadingStats} href="/deposit" />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Order Sekarang",  href: "/services",     color: "gradient-bg neon-glow-sm",           icon: Zap },
              { label: "Top Up Saldo",    href: "/deposit",      color: "bg-green-500/20 border-green-500/30 hover:bg-green-500/30", icon: Plus },
              { label: "Cek Order",       href: "/orders",       color: "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30",    icon: Activity },
              { label: "Hubungi Kami",    href: "/tickets",      color: "bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30", icon: ArrowRight },
            ].map((q) => (
              <Link key={q.href} href={q.href}>
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-white transition-all cursor-pointer hover:scale-[1.02] ${q.color}`}>
                  <q.icon className="w-4 h-4" />
                  {q.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Order Terbaru
              </h2>
              <Link href="/orders">
                <span className="text-xs text-primary hover:underline cursor-pointer">Lihat semua →</span>
              </Link>
            </div>

            {loadingOrders ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !(recent as any[])?.length ? (
              <div className="p-10 text-center text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada order</p>
                <Link href="/services">
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                    <Plus className="w-3 h-3" /> Buat order pertama kamu
                  </div>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {(recent as any[]).slice(0, 8).map((order: any) => (
                  <div key={order.id} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      #{order.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{order.serviceName}</div>
                      <div className="text-xs text-muted-foreground truncate">{order.link}</div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-sm font-semibold">{formatRupiah(order.charge)}</div>
                      <StatusIcon status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="glass rounded-2xl border border-primary/20 p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Tips Penggunaan
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• Pastikan link yang kamu masukkan <strong className="text-foreground">akun publik</strong> agar order dapat diproses</li>
              <li>• Order biasanya selesai dalam <strong className="text-foreground">1-24 jam</strong> tergantung layanan</li>
              <li>• Gunakan fitur <strong className="text-foreground">Referral</strong> untuk dapat bonus saldo gratis</li>
            </ul>
          </div>
        </div>
      </AppLayout>
    );
  }
  