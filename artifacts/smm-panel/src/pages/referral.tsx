import { AppLayout } from "@/components/layout/AppLayout";
  import { useGetReferralInfo } from "@workspace/api-client-react";
  import { useAuth } from "@/contexts/AuthContext";
  import { formatRupiah } from "@/lib/utils";
  import { toast } from "sonner";
  import { Copy, Users, Gift, TrendingUp, Share2, CheckCircle2 } from "lucide-react";
  import { Skeleton } from "@/components/ui/skeleton";

  export default function Referral() {
    const { user } = useAuth();
    const { data: info, isLoading } = useGetReferralInfo();

    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ""}`;

    const copyText = (text: string, label = "Disalin!") => {
      navigator.clipboard.writeText(text);
      toast.success(label);
    };

    return (
      <AppLayout>
        <div className="space-y-5 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold font-display">Program Referral</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Undang teman dan dapatkan bonus saldo</p>
          </div>

          {/* Banner */}
          <div className="glass rounded-2xl border border-primary/30 p-5 bg-gradient-to-br from-primary/10 to-purple-500/10 neon-glow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Undang Teman, Dapat Bonus!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Dapatkan komisi setiap kali teman yang kamu referral melakukan deposit atau order.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
            ) : [
              { icon: Users,      label: "Total Referral",  value: (info as any)?.totalReferrals || 0,         color: "text-blue-400",   bg: "bg-blue-400/10" },
              { icon: TrendingUp, label: "Total Komisi",    value: formatRupiah((info as any)?.totalEarned || 0), color: "text-green-400",  bg: "bg-green-400/10" },
              { icon: Gift,       label: "Bulan Ini",       value: formatRupiah((info as any)?.monthEarned || 0), color: "text-primary",    bg: "bg-primary/10" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl border border-white/10 p-4 text-center">
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Share2 className="w-4 h-4 text-primary" /> Link Referral Kamu</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Kode Referral</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 px-3 py-2.5 font-mono text-sm font-bold text-primary">
                    {user?.referralCode || "-"}
                  </div>
                  <button onClick={() => copyText(user?.referralCode || "", "Kode disalin!")} className="p-2.5 rounded-xl glass border border-white/10 hover:bg-white/10 transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Link Referral</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-muted-foreground truncate font-mono">
                    {referralLink}
                  </div>
                  <button onClick={() => copyText(referralLink, "Link disalin!")} className="p-2.5 rounded-xl glass border border-white/10 hover:bg-white/10 transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => copyText(referralLink, "Link referral disalin!")}
              className="w-full py-2.5 rounded-xl shimmer-btn text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Bagikan Link Referral
            </button>
          </div>

          {/* Cara kerja */}
          <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
            <h2 className="font-semibold">Cara Kerja</h2>
            <div className="space-y-3">
              {[
                { step: "1", text: "Bagikan link atau kode referral kamu ke teman" },
                { step: "2", text: "Teman mendaftar menggunakan link atau kode kamu" },
                { step: "3", text: "Kamu mendapat komisi setiap kali teman melakukan deposit" },
                { step: "4", text: "Komisi langsung masuk ke saldo akun kamu" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs text-white font-bold shrink-0">
                    {s.step}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                  <CheckCircle2 className="w-4 h-4 text-green-400/50 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  