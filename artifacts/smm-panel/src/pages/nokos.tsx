import { AppLayout } from "@/components/layout/AppLayout";
  import { useListNokosCountries, useListNokosApps, useBuyNumber, useListActiveNumbers } from "@workspace/api-client-react";
  import { useState } from "react";
  import { formatRupiah } from "@/lib/utils";
  import { toast } from "sonner";
  import { Phone, Globe, ChevronRight, Loader2, CheckCircle2, Clock, Copy, ArrowLeft, Smartphone, RefreshCw, XCircle } from "lucide-react";

  function CountrySkeleton() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-white/5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-2" />
            <div className="h-3 bg-white/10 rounded w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  function AppSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-white/5 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  export default function Nokos() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedCountryName, setSelectedCountryName] = useState<string>("");
    const [orderingAppId, setOrderingAppId] = useState<string | null>(null);

    const { data: countries, isLoading: isLoadingCountries } = useListNokosCountries();
    const { data: apps, isLoading: isLoadingApps } = useListNokosApps(
      { country: selectedCountry || undefined },
      { query: { enabled: !!selectedCountry, queryKey: ["nokos-apps", selectedCountry] } }
    );
    const { data: activeNumbers, refetch: refetchActive } = useListActiveNumbers();
    const buyMutation = useBuyNumber();

    const handleBuy = (appId: string, appName: string) => {
      setOrderingAppId(appId);
      buyMutation.mutate(
        { data: { appId: parseInt(appId, 10), country: selectedCountry! } },
        {
          onSuccess: () => {
            toast.success(`Nomor ${appName} berhasil dipesan!`);
            setOrderingAppId(null);
            refetchActive();
          },
          onError: (err: any) => {
            toast.error(err?.message || "Gagal memesan nomor");
            setOrderingAppId(null);
          },
        }
      );
    };

    const copyText = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Nomor disalin!");
    };

    return (
      <AppLayout>
        <div className="space-y-6 pb-10">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center neon-glow-sm">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Virtual Number</h1>
              <p className="text-muted-foreground text-sm">Nomor virtual untuk OTP & verifikasi sosmed</p>
            </div>
          </div>

          {/* Active numbers */}
          {activeNumbers && (activeNumbers as any[]).length > 0 && (
            <div className="glass rounded-2xl border border-green-400/20 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-sm">Nomor Aktif ({(activeNumbers as any[]).length})</span>
                </div>
                <button onClick={() => refetchActive()} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {(activeNumbers as any[]).map((n: any) => (
                  <div key={n.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-400/10 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="font-mono font-semibold text-sm">{n.number || n.phone}</div>
                        <div className="text-xs text-muted-foreground">{n.appName || n.app} · {n.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.smsCode && (
                        <span className="px-2 py-1 rounded-lg bg-green-400/10 text-green-400 text-xs font-mono font-bold">{n.smsCode}</span>
                      )}
                      <button onClick={() => copyText(n.number || n.phone)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                        <Clock className="w-3 h-3" /> Aktif
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: pilih negara */}
          {!selectedCountry ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Pilih Negara</h2>
                <span className="text-xs text-muted-foreground">(Langkah 1/2)</span>
              </div>

              {isLoadingCountries ? <CountrySkeleton /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(countries as any[] | undefined)?.map((c: any) => (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCountry(c.code); setSelectedCountryName(c.name); }}
                      className="glass rounded-xl p-4 border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all hover:scale-105 text-center group"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{c.flag}</div>
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {!isLoadingCountries && (!countries || (countries as any[]).length === 0) && (
                <div className="glass rounded-2xl border border-white/10 p-10 text-center">
                  <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Tidak ada negara tersedia saat ini</p>
                </div>
              )}
            </div>
          ) : (
            /* Step: pilih aplikasi */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Ganti Negara
                </button>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">
                    Pilih Aplikasi{" "}
                    <span className="text-muted-foreground font-normal">— {selectedCountryName}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground">(Langkah 2/2)</span>
                </div>
              </div>

              {isLoadingApps ? <AppSkeleton /> : !apps || (apps as any[]).length === 0 ? (
                <div className="glass rounded-2xl border border-white/10 p-10 text-center">
                  <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Tidak ada aplikasi tersedia untuk negara ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(apps as any[]).map((app: any) => (
                    <div key={app.id} className="glass rounded-xl border border-white/10 hover:border-primary/30 transition-all p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {(app.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{app.name}</div>
                            {app.successRate != null && (
                              <div className="text-xs text-green-400">{app.successRate}% sukses</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-primary font-bold text-sm">{formatRupiah(app.price)}</div>
                          {app.stock != null && (
                            <div className="text-xs text-muted-foreground">{app.stock} stok</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuy(app.id, app.name)}
                        disabled={buyMutation.isPending && orderingAppId === app.id}
                        className="w-full py-2 rounded-xl shimmer-btn text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-1.5"
                      >
                        {buyMutation.isPending && orderingAppId === app.id
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memesan...</>
                          : <><Phone className="w-3.5 h-3.5" /> Pesan Nomor</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }
  