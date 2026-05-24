import { Switch, Route, Router as WouterRouter } from "wouter";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { Toaster } from "@/components/ui/sonner";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import { AuthProvider } from "@/contexts/AuthContext";
  import { ProtectedRoute } from "@/components/ProtectedRoute";
  import { AdminRoute } from "@/components/AdminRoute";
  import NotFound from "@/pages/not-found";
  import Login from "@/pages/login";
  import Register from "@/pages/register";
  import Dashboard from "@/pages/dashboard";
  import Services from "@/pages/services";
  import Orders from "@/pages/orders";
  import Deposit from "@/pages/deposit";
  import Transactions from "@/pages/transactions";
  import Nokos from "@/pages/nokos";
  import Tickets from "@/pages/tickets";
  import Notifications from "@/pages/notifications";
  import Referral from "@/pages/referral";
  import Profile from "@/pages/profile";
  import AdminDashboard from "@/pages/admin/dashboard";
  import AdminUsers from "@/pages/admin/users";
  import AdminServices from "@/pages/admin/services";
  import AdminOrders from "@/pages/admin/orders";
  import AdminDeposits from "@/pages/admin/deposits";
  import { Sparkles, TrendingUp, Users, Zap, Instagram, Youtube, Twitter, ArrowRight, Shield, Clock, Star } from "lucide-react";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false },
    },
  });

  const features = [
    { icon: Zap, title: "Proses Cepat", desc: "Order diproses otomatis dalam hitungan menit", color: "text-yellow-400" },
    { icon: Shield, title: "100% Aman", desc: "Garansi refill jika followers drop", color: "text-green-400" },
    { icon: Clock, title: "24/7 Aktif", desc: "Support siap membantu kapan saja", color: "text-blue-400" },
    { icon: Star, title: "Kualitas HQ", desc: "Followers & likes berkualitas tinggi", color: "text-purple-400" },
  ];

  const platforms = [
    { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-500" },
    { icon: Youtube, name: "YouTube", color: "from-red-500 to-red-600" },
    { icon: Twitter, name: "TikTok", color: "from-gray-800 to-gray-900" },
  ];

  const stats = [
    { value: "50K+", label: "Pengguna Aktif" },
    { value: "2M+", label: "Order Selesai" },
    { value: "500+", label: "Layanan Tersedia" },
    { value: "99%", label: "Kepuasan Pelanggan" },
  ];

  function Home() {
    return (
      <div className="min-h-screen mesh-bg relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg font-display gradient-text-blue">SMM Panel Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Masuk
            </a>
            <a
              href="/register"
              className="text-sm px-4 py-2 rounded-xl gradient-bg text-white font-semibold neon-glow-sm hover:opacity-90 transition-all hover:scale-105"
            >
              Daftar Gratis
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative z-10 text-center px-6 pt-10 pb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs text-primary font-medium mb-6 animate-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Platform SMM Terpercaya #1 Indonesia
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight animate-fade-up-delay-1">
            Tingkatkan{" "}
            <span className="gradient-text neon-text">Social Media</span>
            <br />
            Kamu Sekarang
          </h1>

          <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl mx-auto animate-fade-up-delay-2">
            Followers, likes, views, dan komentar berkualitas tinggi untuk semua platform. Proses cepat, harga terjangkau, garansi penuh.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 animate-fade-up-delay-2">
            <a
              href="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl shimmer-btn text-white font-semibold neon-glow hover:opacity-90 transition-all hover:scale-105"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border text-foreground font-semibold hover:border-primary/40 transition-all hover:scale-105"
            >
              Sudah Punya Akun
            </a>
          </div>

          {/* Platforms */}
          <div className="flex items-center justify-center gap-3 mt-8 animate-fade-up-delay-3">
            <span className="text-xs text-muted-foreground">Tersedia untuk:</span>
            {platforms.map((p) => (
              <div key={p.name} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                <p.icon className="w-4 h-4 text-white" />
              </div>
            ))}
            <span className="text-xs text-muted-foreground">& lebih banyak lagi</span>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 px-6 pb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass-strong rounded-2xl p-5 text-center card-hover">
                <div className="text-2xl font-bold gradient-text-blue font-display">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 px-6 pb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-foreground">Kenapa Pilih Kami?</h2>
            <p className="text-muted-foreground text-sm mt-2">Ribuan pelanggan sudah percaya pada layanan kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-5 flex items-start gap-4 card-hover">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 px-6 pb-16 max-w-lg mx-auto text-center">
          <div className="glass-strong rounded-2xl p-8 border border-primary/20">
            <h2 className="text-xl font-bold font-display mb-2">Siap Mulai?</h2>
            <p className="text-muted-foreground text-sm mb-5">Daftar gratis sekarang dan dapatkan bonus saldo untuk order pertama</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl shimmer-btn text-white font-semibold neon-glow hover:opacity-90 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Daftar Gratis Sekarang
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 text-center pb-8 text-xs text-muted-foreground">
          © 2025 SMM Panel Pro · Semua Hak Dilindungi
        </footer>
      </div>
    );
  }

  function Router() {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
        <Route path="/services"><ProtectedRoute><Services /></ProtectedRoute></Route>
        <Route path="/orders"><ProtectedRoute><Orders /></ProtectedRoute></Route>
        <Route path="/deposit"><ProtectedRoute><Deposit /></ProtectedRoute></Route>
        <Route path="/transactions"><ProtectedRoute><Transactions /></ProtectedRoute></Route>
        <Route path="/nokos"><ProtectedRoute><Nokos /></ProtectedRoute></Route>
        <Route path="/tickets"><ProtectedRoute><Tickets /></ProtectedRoute></Route>
        <Route path="/notifications"><ProtectedRoute><Notifications /></ProtectedRoute></Route>
        <Route path="/referral"><ProtectedRoute><Referral /></ProtectedRoute></Route>
        <Route path="/profile"><ProtectedRoute><Profile /></ProtectedRoute></Route>
        <Route path="/admin/dashboard"><AdminRoute><AdminDashboard /></AdminRoute></Route>
        <Route path="/admin/users"><AdminRoute><AdminUsers /></AdminRoute></Route>
        <Route path="/admin/services"><AdminRoute><AdminServices /></AdminRoute></Route>
        <Route path="/admin/orders"><AdminRoute><AdminOrders /></AdminRoute></Route>
        <Route path="/admin/deposits"><AdminRoute><AdminDeposits /></AdminRoute></Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  export default function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter>
              <Router />
            </WouterRouter>
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  