import { Switch, Route, Router as WouterRouter, Link } from "wouter";
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
import Contact from "@/pages/contact";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminServices from "@/pages/admin/services";
import AdminOrders from "@/pages/admin/orders";
import AdminDeposits from "@/pages/admin/deposits";
import {
  Sparkles, TrendingUp, Users, Zap, Shield, Clock, Star, ArrowRight,
  CheckCircle2, ChevronDown, MessageCircle, Headphones, RotateCw,
  CreditCard, Package, BadgeCheck, Menu, X
} from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiTelegram, SiWhatsapp, SiX, SiSpotify } from "react-icons/si";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const features = [
  { icon: Zap,         title: "Proses Otomatis",   desc: "Order diproses 100% otomatis tanpa antre, langsung dikerjakan sistem",  color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: Shield,      title: "Garansi Refill",     desc: "Followers/likes drop? Kami refill gratis hingga order selesai sempurna", color: "text-green-400",  bg: "bg-green-400/10" },
  { icon: Clock,       title: "24/7 Tanpa Henti",  desc: "Platform aktif 24 jam sehari, 7 hari seminggu. Order kapan saja",       color: "text-blue-400",  bg: "bg-blue-400/10" },
  { icon: Star,        title: "Kualitas Premium",  desc: "Akun berkualitas tinggi, tidak bot murahan. Aman dari shadowban",        color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: CreditCard,  title: "Harga Terjangkau",  desc: "Harga terbaik di kelasnya. Mulai dari Rp 1.500 per 1000 followers",     color: "text-pink-400",  bg: "bg-pink-400/10" },
  { icon: Headphones,  title: "Support Responsif", desc: "Tim support siap membantu via tiket sistem dan WhatsApp 24/7",          color: "text-cyan-400",  bg: "bg-cyan-400/10" },
];

const platforms = [
  { icon: SiInstagram, name: "Instagram",  color: "from-pink-500 to-purple-600",   services: ["Followers", "Likes", "Views", "Komentar", "Story Views"] },
  { icon: SiTiktok,    name: "TikTok",     color: "from-gray-700 to-gray-900",     services: ["Followers", "Likes", "Views", "Shares", "Komentar"] },
  { icon: SiYoutube,   name: "YouTube",    color: "from-red-500 to-red-700",       services: ["Views", "Subscribers", "Likes", "Komentar", "Watch Hours"] },
  { icon: SiX,         name: "Twitter/X",  color: "from-gray-700 to-gray-900",     services: ["Followers", "Likes", "Retweet", "Impressions"] },
  { icon: SiFacebook,  name: "Facebook",   color: "from-blue-500 to-blue-700",     services: ["Page Likes", "Post Likes", "Followers", "Views"] },
  { icon: SiTelegram,  name: "Telegram",   color: "from-sky-400 to-sky-600",       services: ["Members", "Views", "Reactions", "Online"] },
  { icon: SiSpotify,   name: "Spotify",    color: "from-green-500 to-green-700",   services: ["Plays", "Followers", "Monthly Listeners"] },
  { icon: SiWhatsapp,  name: "WhatsApp",   color: "from-green-500 to-green-700",   services: ["Channel Members", "Status Views"] },
];

const steps = [
  { num: "01", title: "Daftar Gratis",   desc: "Buat akun gratis dalam 30 detik. Tidak perlu kartu kredit.",    icon: Users },
  { num: "02", title: "Top Up Saldo",   desc: "Isi saldo via QRIS, transfer bank, atau dompet digital.",        icon: CreditCard },
  { num: "03", title: "Pilih Layanan",  desc: "Pilih platform dan layanan yang kamu butuhkan dari 500+ pilihan.", icon: Package },
  { num: "04", title: "Order & Done!",  desc: "Masukkan link target, konfirmasi order, dan selesai otomatis.",   icon: BadgeCheck },
];

const testimonials = [
  { name: "Andi Pratama",  role: "Content Creator", text: "Sudah pakai 6 bulan, followers Instagram naik drastis. Prosesnya cepat banget dan nggak pernah hilang!", stars: 5 },
  { name: "Siti Rahma",    role: "Online Shop Owner", text: "Toko online saya makin ramai setelah follower naik. Customer lebih percaya lihat akun dengan banyak followers.", stars: 5 },
  { name: "Budi Santoso",  role: "Youtuber", text: "Views YouTube saya naik 10x dalam seminggu. Harga terjangkau, kualitas premium. Paling rekomen!", stars: 5 },
  { name: "Dewi Lestari",  role: "Influencer", text: "Platform terbaik yang pernah saya coba! Support responsif dan hasilnya nyata. Auto repeat order terus.", stars: 5 },
];

const faqs = [
  { q: "Apakah layanan ini aman?", a: "Ya, sangat aman. Kami menggunakan metode organik dan tidak memerlukan password akun Anda. Tidak ada risiko banned." },
  { q: "Berapa lama proses pengerjaan?", a: "Sebagian besar order selesai dalam 1-24 jam. Beberapa layanan premium bisa memakan waktu hingga 3 hari." },
  { q: "Bagaimana jika followers drop?", a: "Kami memberikan garansi refill gratis. Jika followers berkurang dalam masa garansi, lapor ke support kami." },
  { q: "Metode pembayaran apa yang tersedia?", a: "Kami menerima QRIS (GoPay, OVO, DANA, ShopeePay), transfer bank BCA/BRI/BNI/Mandiri, dan dompet digital." },
  { q: "Apakah ada minimal order?", a: "Tergantung layanan, mulai dari 50 hingga 1.000 unit. Detail minimum ada di halaman order." },
  { q: "Apakah akun saya butuh bersifat publik?", a: "Ya, akun harus publik saat order berlangsung agar layanan dapat diproses. Setelah selesai bisa diprivat kembali." },
];

const stats = [
  { value: "50K+",  label: "Pengguna Aktif",   icon: Users },
  { value: "2M+",   label: "Order Selesai",     icon: Package },
  { value: "500+",  label: "Layanan Tersedia",  icon: Sparkles },
  { value: "99%",   label: "Kepuasan Member",   icon: Star },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-semibold pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-white/10 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen mesh-bg relative overflow-x-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-20 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center neon-glow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg font-display gradient-text-blue">SMM Panel Pro</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#layanan" className="hover:text-foreground transition-colors">Layanan</a>
            <a href="#cara-kerja" className="hover:text-foreground transition-colors">Cara Kerja</a>
            <a href="#harga" className="hover:text-foreground transition-colors">Harga</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer px-3 py-2">
                Masuk
              </span>
            </Link>
            <Link href="/register">
              <span className="text-sm px-5 py-2.5 rounded-xl gradient-bg text-white font-semibold neon-glow-sm hover:opacity-90 transition-all hover:scale-105 cursor-pointer">
                Daftar Gratis
              </span>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#layanan" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">Layanan</a>
            <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">Cara Kerja</a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">Harga</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">FAQ</a>
            <div className="flex gap-3 pt-2">
              <Link href="/login"><span className="flex-1 text-center py-2.5 rounded-xl glass border border-white/10 text-sm font-medium cursor-pointer">Masuk</span></Link>
              <Link href="/register"><span className="flex-1 text-center py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold cursor-pointer">Daftar Gratis</span></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 sm:px-6 pt-16 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs text-primary font-medium mb-8 animate-fade-up">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Platform SMM Terpercaya #1 Indonesia 🇮🇩
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight animate-fade-up-delay-1">
          Tingkatkan{" "}
          <span className="gradient-text neon-text">Social Media</span>
          <br />
          Kamu Sekarang
        </h1>

        <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto animate-fade-up-delay-2 leading-relaxed">
          Followers, likes, views, dan komentar berkualitas tinggi untuk semua platform.
          Proses otomatis 24/7, harga mulai <strong className="text-foreground">Rp 1.500/1K</strong>, garansi refill penuh.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up-delay-2">
          <Link href="/register">
            <span className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl shimmer-btn text-white font-bold text-base neon-glow hover:opacity-90 transition-all hover:scale-105 cursor-pointer">
              <Zap className="w-5 h-5" /> Mulai Gratis Sekarang
            </span>
          </Link>
          <a href="#layanan" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass border border-border text-foreground font-semibold hover:border-primary/40 transition-all hover:scale-105">
            Lihat Layanan <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up-delay-3">
          {[
            { icon: Shield, text: "100% Aman" },
            { icon: RotateCw, text: "Garansi Refill" },
            { icon: Clock, text: "Proses Otomatis" },
            { icon: Headphones, text: "Support 24/7" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <b.icon className="w-3.5 h-3.5 text-primary" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-4 sm:px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-strong rounded-2xl p-5 text-center card-hover border border-white/5">
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
              <div className="text-2xl sm:text-3xl font-bold gradient-text-blue font-display">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform section */}
      <section id="layanan" className="relative z-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Package className="w-3.5 h-3.5" /> 500+ Layanan Tersedia
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Semua Platform, Satu Tempat</h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto">
            Kami menyediakan layanan untuk 8+ platform sosial media terpopuler dengan harga terbaik
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {platforms.map((p) => (
            <div key={p.name} className="glass rounded-2xl p-4 border border-white/10 card-hover group cursor-pointer hover:border-white/20 transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{p.name}</h3>
              <div className="space-y-1">
                {p.services.slice(0, 3).map((s) => (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                    {s}
                  </div>
                ))}
                {p.services.length > 3 && (
                  <div className="text-xs text-primary/70">+{p.services.length - 3} lainnya</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/register">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl shimmer-btn text-white text-sm font-semibold neon-glow-sm hover:opacity-90 transition-all hover:scale-105 cursor-pointer">
              <Sparkles className="w-4 h-4" /> Lihat Semua Layanan
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="harga" className="relative z-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Kenapa SMM Panel Pro?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Fitur Unggulan Kami</h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto">
            Ribuan kreator, bisnis, dan agency sudah percaya pada layanan kami
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 flex items-start gap-4 card-hover border border-white/5 hover:border-white/10 transition-all">
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="relative z-10 px-4 sm:px-6 pb-20 max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3.5 h-3.5" /> Super Mudah
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Cara Kerjanya</h2>
          <p className="text-muted-foreground text-sm mt-3">Hanya 4 langkah mudah untuk mulai boost sosial mediamu</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="text-center group relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 neon-glow-sm group-hover:scale-110 transition-transform shadow-lg">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-xs text-primary/60 font-mono font-bold mb-1">{step.num}</div>
              <h3 className="font-bold text-sm mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Testimoni Member
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Apa Kata Mereka?</h2>
          <p className="text-muted-foreground text-sm mt-3">Rating rata-rata 4.9/5 dari lebih 10.000+ review</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-4 border border-white/10 card-hover flex flex-col">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-4 sm:px-6 pb-20 max-w-2xl mx-auto scroll-mt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 text-purple-400 text-xs font-medium mb-4">
            <MessageCircle className="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Pertanyaan Umum</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-2xl mx-auto">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-primary/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 neon-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3">
              Siap Boost Social Media?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Bergabung dengan 50.000+ pengguna yang sudah merasakan manfaatnya.
              Daftar gratis, tidak perlu kartu kredit.
            </p>
            <Link href="/register">
              <span className="inline-flex items-center gap-2 px-10 py-4 rounded-xl shimmer-btn text-white font-bold text-base neon-glow hover:opacity-90 transition-all hover:scale-105 cursor-pointer">
                <Zap className="w-5 h-5" /> Daftar Sekarang — GRATIS
              </span>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Sudah punya akun?{" "}
              <Link href="/login"><span className="text-primary hover:underline cursor-pointer">Masuk di sini</span></Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pb-8 pt-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold font-display gradient-text-blue">SMM Panel Pro</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Platform SMM terpercaya #1 Indonesia. Boost social media kamu dengan layanan berkualitas tinggi.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Layanan</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook"].map(p => (
                  <li key={p} className="hover:text-foreground transition-colors cursor-pointer">{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Akun</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/register"><span className="hover:text-foreground transition-colors cursor-pointer">Daftar Gratis</span></Link></li>
                <li><Link href="/login"><span className="hover:text-foreground transition-colors cursor-pointer">Masuk</span></Link></li>
                <li><a href="#cara-kerja" className="hover:text-foreground transition-colors">Cara Kerja</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Bantuan</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">WhatsApp Support</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Telegram</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Kebijakan Privasi</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Syarat & Ketentuan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2025 SMM Panel Pro · Semua Hak Dilindungi</p>
            <div className="flex items-center gap-2">
              {[SiInstagram, SiTiktok, SiYoutube, SiX].map((Icon, i) => (
                <div key={i} className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
      <Route path="/contact"><ProtectedRoute><Contact /></ProtectedRoute></Route>
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
