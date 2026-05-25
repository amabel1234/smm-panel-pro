import { Link, useLocation } from "wouter";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useRegister } from "@workspace/api-client-react";
  import { useAuth } from "@/contexts/AuthContext";
  import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { toast } from "sonner";
  import { Loader2, User, Mail, Lock, Gift, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

  const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    referralCode: z.string().optional(),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const stats = [
    { icon: Users, label: "Pengguna Aktif", value: "50K+" },
    { icon: TrendingUp, label: "Order Selesai", value: "2M+" },
    { icon: Zap, label: "Layanan", value: "500+" },
  ];

  export default function Register() {
    const [_, setLocation] = useLocation();
    const { login: setAuth } = useAuth();

    const form = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: { name: "", email: "", password: "", referralCode: "" },
    });

    const registerMutation = useRegister();

    const onSubmit = (data: RegisterFormValues) => {
      registerMutation.mutate(
        { data },
        {
          onSuccess: (res) => {
            setAuth(res.token, res.user);
            toast.success("Registrasi berhasil! Selamat datang 🎉");
            setLocation("/dashboard");
          },
          onError: (err: any) => {
            const msg = err?.message || "";
            if (msg.includes("405") || msg.includes("fetch") || err?.status === 405 || err?.status === 404) {
              toast.error("Server sedang maintenance. Coba lagi nanti.");
            } else if (err?.status === 409) {
              toast.error("Email sudah terdaftar. Silakan login.");
            } else {
              toast.error(err?.data?.message || msg || "Registrasi gagal. Coba lagi.");
            }
          },
        }
      );
    };

    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg neon-glow mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text font-display">SMM Panel Pro</h1>
            <p className="text-muted-foreground mt-1 text-sm">Platform SMM Terpercaya #1 Indonesia</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up-delay-1">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-xl p-3 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-sm font-bold text-foreground">{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass-strong rounded-2xl p-6 shadow-2xl animate-fade-up-delay-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Buat Akun Baru</h2>
              <p className="text-muted-foreground text-sm mt-1">Bergabung dan mulai tingkatkan media sosialmu</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative input-glow rounded-xl border border-border bg-input/50 focus-within:border-primary/60 transition-all duration-200">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Nama Lengkap"
                            className="border-0 bg-transparent pl-10 h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative input-glow rounded-xl border border-border bg-input/50 focus-within:border-primary/60 transition-all duration-200">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Email"
                            className="border-0 bg-transparent pl-10 h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative input-glow rounded-xl border border-border bg-input/50 focus-within:border-primary/60 transition-all duration-200">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Password (min. 6 karakter)"
                            className="border-0 bg-transparent pl-10 h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative input-glow rounded-xl border border-border bg-input/50 focus-within:border-primary/60 transition-all duration-200">
                          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Kode Referral (opsional)"
                            className="border-0 bg-transparent pl-10 h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-12 rounded-xl shimmer-btn text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed neon-glow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Membuat Akun...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Daftar Sekarang — Gratis!
                    </>
                  )}
                </button>
              </form>
            </Form>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Login di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-5 animate-fade-up-delay-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Aman & Terpercaya
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              SSL Encrypted
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    );
  }
  