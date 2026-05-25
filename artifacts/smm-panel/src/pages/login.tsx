import { Link, useLocation } from "wouter";
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useLogin } from "@workspace/api-client-react";
  import { useAuth } from "@/contexts/AuthContext";
  import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { toast } from "sonner";
  import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";

  const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  export default function Login() {
    const [_, setLocation] = useLocation();
    const { login: setAuth } = useAuth();

    const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: "", password: "" },
    });

    const loginMutation = useLogin();

    const onSubmit = (data: LoginFormValues) => {
      loginMutation.mutate(
        { data },
        {
          onSuccess: (res) => {
            setAuth(res.token, res.user);
            toast.success("Login berhasil! Selamat datang kembali 👋");
            setLocation("/dashboard");
          },
          onError: (err: any) => {
            const status = err?.status;
            if (!status || err instanceof TypeError) {
              toast.error("Tidak dapat terhubung ke server. Periksa koneksi internet kamu.");
            } else if (status === 503 || status === 502) {
              toast.error("Server sedang maintenance. Coba lagi nanti.");
            } else if (status === 401) {
              toast.error("Email atau password salah.");
            } else {
              toast.error(err?.data?.message || err?.data?.error || err?.message || "Login gagal. Coba lagi.");
            }
          },
        }
      );
    };

    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg neon-glow mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text font-display">SMM Panel Pro</h1>
            <p className="text-muted-foreground mt-1 text-sm">Masuk ke akun kamu</p>
          </div>

          {/* Card */}
          <div className="glass-strong rounded-2xl p-6 shadow-2xl animate-fade-up-delay-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Selamat Datang!</h2>
              <p className="text-muted-foreground text-sm mt-1">Masukkan email & password kamu</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            placeholder="Password"
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
                  disabled={loginMutation.isPending}
                  className="w-full h-12 rounded-xl shimmer-btn text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed neon-glow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Masuk...
                    </>
                  ) : (
                    <>
                      Masuk ke Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </Form>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Daftar gratis
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-5 animate-fade-up-delay-2">
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
  