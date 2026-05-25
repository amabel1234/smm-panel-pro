import { AppLayout } from "@/components/layout/AppLayout";
  import { useAuth } from "@/contexts/AuthContext";
  import { useGetMe, useGetApiKey, useRegenerateApiKey } from "@workspace/api-client-react";
  import { formatRupiah } from "@/lib/utils";
  import { useState } from "react";
  import { toast } from "sonner";
  import { User, Mail, Shield, Key, Copy, RefreshCw, Loader2, Wallet, ShoppingCart, TrendingUp, Eye, EyeOff } from "lucide-react";

  export default function Profile() {
    const { user } = useAuth();
    const { data: me } = useGetMe();
    const { data: apiKeyData, refetch: refetchKey } = useGetApiKey();
    const regenMutation = useRegenerateApiKey();
    const [showKey, setShowKey] = useState(false);
    const profile: any = (me as any) || user;

    const copyText = (text: string, label = "Disalin!") => {
      navigator.clipboard.writeText(text);
      toast.success(label);
    };

    const handleRegen = () => {
      regenMutation.mutate(undefined, {
        onSuccess: () => { toast.success("API key baru dibuat!"); refetchKey(); },
        onError: (err: any) => toast.error(err?.message || "Gagal generate API key"),
      });
    };

    return (
      <AppLayout>
        <div className="space-y-5 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold font-display">Profil Saya</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Informasi akun kamu</p>
          </div>

          {/* Avatar + info */}
          <div className="glass rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold neon-glow-sm">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-lg font-bold">{profile?.name}</div>
                <div className="text-sm text-muted-foreground">{profile?.email}</div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile?.role === "admin" ? "bg-red-400/10 text-red-400 border border-red-400/30" : "bg-primary/10 text-primary border border-primary/30"}`}>
                    {profile?.role === "admin" ? "Administrator" : "Member"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Wallet,       label: "Saldo",         value: formatRupiah(profile?.balance || 0),          color: "text-primary" },
                { icon: ShoppingCart, label: "Total Order",   value: profile?.totalOrders || 0,                    color: "text-blue-400" },
                { icon: TrendingUp,   label: "Total Deposit", value: formatRupiah(profile?.totalDeposited || 0),   color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info akun */}
          <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Informasi Akun</h2>
            {[
              { icon: User,   label: "Nama Lengkap",  value: profile?.name },
              { icon: Mail,   label: "Email",         value: profile?.email },
              { icon: Shield, label: "Kode Referral", value: profile?.referralCode },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">{field.label}</div>
                  <div className="text-sm font-medium">{field.value || "-"}</div>
                </div>
                {field.label === "Kode Referral" && field.value && (
                  <button onClick={() => copyText(field.value!, "Kode referral disalin!")} className="p-1.5 rounded-lg hover:bg-white/10">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* API Key */}
          <div className="glass rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> API Key</h2>
              <button onClick={handleRegen} disabled={regenMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground disabled:opacity-50">
                {regenMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Generate Baru
              </button>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 font-mono text-xs truncate">
                {(apiKeyData as any)?.apiKey
                  ? (showKey ? (apiKeyData as any).apiKey : (apiKeyData as any).apiKey.substring(0, 8) + "••••••••••••••••••••••••")
                  : "Belum ada API key — klik Generate Baru"}
              </div>
              <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
                {showKey ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              {(apiKeyData as any)?.apiKey && (
                <button onClick={() => copyText((apiKeyData as any).apiKey, "API key disalin!")} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">API key digunakan untuk integrasi sistem eksternal. Jaga kerahasiaannya!</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  