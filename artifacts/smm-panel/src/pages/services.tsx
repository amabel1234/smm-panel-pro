import { useState } from "react";
  import { AppLayout } from "@/components/layout/AppLayout";
  import { useListServices, useListServiceCategories, useCreateOrder, useGetMe } from "@workspace/api-client-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import { formatRupiah } from "@/lib/utils";
  import { toast } from "sonner";
  import { Search, Loader2, ShoppingCart, X, ChevronRight, Star, Zap, Info } from "lucide-react";
  import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiTelegram, SiWhatsapp, SiX, SiSpotify } from "react-icons/si";

  function getPlatformIcon(name: string) {
    const n = (name || "").toLowerCase();
    if (n.includes("instagram")) return <SiInstagram className="text-pink-400 w-4 h-4" />;
    if (n.includes("tiktok"))    return <SiTiktok    className="text-white w-4 h-4" />;
    if (n.includes("youtube"))   return <SiYoutube   className="text-red-400 w-4 h-4" />;
    if (n.includes("facebook"))  return <SiFacebook  className="text-blue-400 w-4 h-4" />;
    if (n.includes("telegram"))  return <SiTelegram  className="text-sky-400 w-4 h-4" />;
    if (n.includes("whatsapp"))  return <SiWhatsapp  className="text-green-400 w-4 h-4" />;
    if (n.includes("twitter") || n.includes(" x ")) return <SiX className="text-white w-4 h-4" />;
    if (n.includes("spotify"))   return <SiSpotify   className="text-green-500 w-4 h-4" />;
    return <Zap className="text-primary w-4 h-4" />;
  }

  function getPlatformBorder(name: string) {
    const n = (name || "").toLowerCase();
    if (n.includes("instagram")) return "border-pink-500/20 hover:border-pink-500/40";
    if (n.includes("tiktok"))    return "border-gray-500/20 hover:border-gray-400/40";
    if (n.includes("youtube"))   return "border-red-500/20 hover:border-red-500/40";
    if (n.includes("facebook"))  return "border-blue-500/20 hover:border-blue-500/40";
    if (n.includes("telegram"))  return "border-sky-500/20 hover:border-sky-500/40";
    return "border-white/10 hover:border-primary/30";
  }

  export default function Services() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [orderLink, setOrderLink] = useState("");
    const [orderQuantity, setOrderQuantity] = useState(1000);

    const { data: services, isLoading: isLoadingServices } = useListServices({
      search: search || undefined,
      category: selectedCategory || undefined,
    });
    const { data: categories, isLoading: isLoadingCategories } = useListServiceCategories();
    const { data: me } = useGetMe();
    const createOrderMutation = useCreateOrder();

    const handleOrder = (service: any) => {
      setSelectedService(service);
      setOrderQuantity(Math.max(service.minOrder ?? 100, Math.min(1000, service.maxOrder ?? 999999)));
      setOrderLink("");
      setOrderModalOpen(true);
    };

    const totalPrice = selectedService
      ? Math.round((selectedService.price / 1000) * orderQuantity)
      : 0;

    const handleSubmitOrder = () => {
      if (!orderLink.trim()) { toast.error("Masukkan link target terlebih dahulu"); return; }
      if (orderQuantity < (selectedService.minOrder ?? 1)) { toast.error("Jumlah di bawah minimum"); return; }
      if (orderQuantity > (selectedService.maxOrder ?? 999999)) { toast.error("Jumlah melebihi maksimum"); return; }
      if ((me as any)?.balance < totalPrice) { toast.error("Saldo tidak cukup. Silakan top up terlebih dahulu."); return; }
      createOrderMutation.mutate(
        { data: { serviceId: selectedService.id, link: orderLink, quantity: orderQuantity } },
        {
          onSuccess: () => { toast.success("Order berhasil dibuat!"); setOrderModalOpen(false); },
          onError: (err: any) => toast.error(err?.message || "Gagal membuat order"),
        }
      );
    };

    return (
      <AppLayout>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Order Layanan</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Pilih layanan sosial media yang kamu butuhkan</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Sidebar Kategori */}
            <div className="w-full md:w-52 shrink-0">
              <div className="glass rounded-2xl border border-white/10 overflow-hidden md:sticky md:top-20">
                <div className="p-3 border-b border-white/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</span>
                </div>
                <div className="p-2 max-h-64 md:max-h-[65vh] overflow-y-auto space-y-0.5">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${!selectedCategory ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                  >
                    <span>🌐 Semua Layanan</span>
                    {!selectedCategory && <ChevronRight className="w-3 h-3" />}
                  </button>
                  {isLoadingCategories ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 mx-1 my-0.5" />) : (
                    (categories as string[] | undefined)?.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${selectedCategory === cat ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                      >
                        <span className="shrink-0">{getPlatformIcon(cat)}</span>
                        <span className="truncate">{cat}</span>
                        {selectedCategory === cat && <ChevronRight className="w-3 h-3 ml-auto" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Daftar layanan */}
            <div className="flex-1 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari layanan..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors"
                />
              </div>

              {isLoadingServices ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : !(services as any[] | undefined)?.length ? (
                <div className="glass rounded-2xl border border-white/10 p-10 text-center">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Tidak ada layanan ditemukan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(services as any[]).map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOrder(svc)}
                      className={`glass rounded-xl border p-4 cursor-pointer hover:bg-white/5 transition-all group ${getPlatformBorder(svc.category || svc.name)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            {getPlatformIcon(svc.category || svc.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-muted-foreground font-mono">#{svc.id}</span>
                              {svc.isFeatured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                            </div>
                            <div className="text-sm font-medium line-clamp-2 leading-tight">{svc.name}</div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span>Min: <strong className="text-foreground">{(svc.minOrder ?? 0).toLocaleString("id-ID")}</strong></span>
                              <span>Max: <strong className="text-foreground">{(svc.maxOrder ?? 0).toLocaleString("id-ID")}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-primary font-bold text-sm">{formatRupiah(svc.price)}</div>
                          <div className="text-xs text-muted-foreground">per 1000</div>
                          <div className="mt-2">
                            <span className="text-xs px-2.5 py-1 rounded-lg shimmer-btn text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Order →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Order */}
        {orderModalOpen && selectedService && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setOrderModalOpen(false); }}
          >
            <div className="glass rounded-t-2xl md:rounded-2xl border border-primary/30 w-full md:max-w-md p-5 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1.5">
                    {getPlatformIcon(selectedService.category || selectedService.name)}
                    <span>{selectedService.category}</span>
                    <span className="font-mono">#{selectedService.id}</span>
                  </div>
                  <h2 className="font-semibold text-sm line-clamp-2">{selectedService.name}</h2>
                </div>
                <button onClick={() => setOrderModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Harga/1000", value: formatRupiah(selectedService.price) },
                  { label: "Min Order",  value: (selectedService.minOrder ?? 0).toLocaleString("id-ID") },
                  { label: "Max Order",  value: (selectedService.maxOrder ?? 0).toLocaleString("id-ID") },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-xs font-semibold mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Link Target</label>
                <input
                  type="url"
                  value={orderLink}
                  onChange={(e) => setOrderLink(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Pastikan akun target bersifat publik
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Jumlah</label>
                  <span className="text-xs text-muted-foreground">
                    {(selectedService.minOrder ?? 0).toLocaleString("id-ID")} – {(selectedService.maxOrder ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(selectedService.minOrder ?? 1, Math.min(selectedService.maxOrder ?? 999999, parseInt(e.target.value) || 0)))}
                  min={selectedService.minOrder ?? 1}
                  max={selectedService.maxOrder ?? 999999}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm"
                />
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].filter(q => q >= (selectedService.minOrder ?? 0) && q <= (selectedService.maxOrder ?? 999999)).map(q => (
                    <button key={q} onClick={() => setOrderQuantity(q)}
                      className={`flex-1 py-1 rounded-lg text-xs border transition-all ${orderQuantity === q ? "gradient-bg text-white border-transparent" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}>
                      {q >= 1000 ? q / 1000 + "K" : q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground">Total Harga</div>
                  <div className="text-xs text-muted-foreground">Saldo: {formatRupiah((me as any)?.balance ?? 0)}</div>
                </div>
                <span className="font-bold text-primary text-xl">{formatRupiah(totalPrice)}</span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={createOrderMutation.isPending}
                className="w-full py-3 rounded-xl shimmer-btn text-white font-semibold neon-glow hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {createOrderMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                  : <><ShoppingCart className="w-4 h-4" /> Buat Order — {formatRupiah(totalPrice)}</>}
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }
  