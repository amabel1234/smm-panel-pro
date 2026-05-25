import { useState, useMemo } from "react";
  import { AppLayout } from "@/components/layout/AppLayout";
  import { useListServices, useListServiceCategories, useCreateOrder, useGetMe } from "@workspace/api-client-react";
  import { formatRupiah } from "@/lib/utils";
  import { toast } from "sonner";
  import { Loader2, ShoppingCart, ChevronDown, Info, CheckCircle2, Link as LinkIcon, Hash, AlertCircle } from "lucide-react";
  import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiTelegram, SiWhatsapp, SiX, SiSpotify } from "react-icons/si";

  function getPlatformIcon(name: string, cls = "w-4 h-4") {
    const n = (name || "").toLowerCase();
    if (n.includes("instagram")) return <SiInstagram className={cls + " text-pink-400"} />;
    if (n.includes("tiktok"))    return <SiTiktok    className={cls + " text-white"} />;
    if (n.includes("youtube"))   return <SiYoutube   className={cls + " text-red-400"} />;
    if (n.includes("facebook"))  return <SiFacebook  className={cls + " text-blue-400"} />;
    if (n.includes("telegram"))  return <SiTelegram  className={cls + " text-sky-400"} />;
    if (n.includes("whatsapp"))  return <SiWhatsapp  className={cls + " text-green-400"} />;
    if (n.includes("twitter") || n.includes(" x ")) return <SiX className={cls + " text-white"} />;
    if (n.includes("spotify"))   return <SiSpotify   className={cls + " text-green-500"} />;
    return null;
  }

  export default function Services() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [orderLink, setOrderLink] = useState("");
    const [orderQuantity, setOrderQuantity] = useState("");

    const { data: categories, isLoading: isLoadingCategories } = useListServiceCategories();
    const { data: allServices, isLoading: isLoadingServices } = useListServices({});
    const { data: me } = useGetMe();
    const createOrderMutation = useCreateOrder();

    const filteredServices = useMemo(() => {
      if (!allServices || !(allServices as any[]).length) return [];
      if (!selectedCategory) return allServices as any[];
      return (allServices as any[]).filter((s: any) =>
        (s.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }, [allServices, selectedCategory]);

    const selectedService = useMemo(() =>
      (allServices as any[] | undefined)?.find((s: any) => String(s.id) === selectedServiceId),
      [allServices, selectedServiceId]
    );

    const qty = parseInt(orderQuantity) || 0;
    const totalPrice = selectedService && qty > 0
      ? Math.round((selectedService.price / 1000) * qty)
      : 0;
    const balance = (me as any)?.balance ?? 0;
    const canAfford = balance >= totalPrice;

    const handleCategoryChange = (cat: string) => {
      setSelectedCategory(cat);
      setSelectedServiceId("");
    };

    const handleOrder = () => {
      if (!selectedServiceId) { toast.error("Pilih layanan terlebih dahulu"); return; }
      if (!orderLink.trim()) { toast.error("Masukkan username / link target"); return; }
      if (!qty || qty < (selectedService?.minOrder ?? 1)) {
        toast.error("Jumlah minimum: " + (selectedService?.minOrder ?? 1).toLocaleString("id-ID")); return;
      }
      if (qty > (selectedService?.maxOrder ?? 999999)) {
        toast.error("Jumlah maksimum: " + (selectedService?.maxOrder ?? 999999).toLocaleString("id-ID")); return;
      }
      if (balance < totalPrice) {
        toast.error("Saldo tidak cukup. Silakan top up terlebih dahulu."); return;
      }
      createOrderMutation.mutate(
        { data: { serviceId: selectedService.id, link: orderLink, quantity: qty } },
        {
          onSuccess: () => {
            toast.success("Order berhasil dibuat! Sedang diproses...");
            setOrderLink(""); setOrderQuantity(""); setSelectedServiceId(""); setSelectedCategory("");
          },
          onError: (err: any) => toast.error(err?.message || "Gagal membuat order"),
        }
      );
    };

    const selectCls = (active: boolean, disabled: boolean) => {
      let base = "w-full appearance-none px-4 py-3.5 rounded-xl bg-white/5 border text-sm transition-all focus:outline-none pr-10";
      base += active ? " border-primary/50 text-foreground" : " border-white/10 text-muted-foreground";
      base += disabled ? " opacity-40 cursor-not-allowed" : " hover:border-white/20 focus:border-primary/70 cursor-pointer";
      return base;
    };

    const qtyBtnCls = (active: boolean) =>
      "flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all " +
      (active ? "gradient-bg text-white border-transparent" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10");

    const balanceCls = canAfford
      ? "rounded-xl px-4 py-2.5 flex items-center justify-between text-xs bg-green-400/5 border border-green-400/20"
      : "rounded-xl px-4 py-2.5 flex items-center justify-between text-xs bg-red-400/5 border border-red-400/20";

    const balanceTextCls = "font-semibold flex items-center gap-1 " + (canAfford ? "text-green-400" : "text-red-400");

    return (
      <AppLayout>
        <div className="space-y-4 max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold font-display">Buat Order</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Isi form di bawah untuk mulai order</p>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-5 space-y-5">

            {/* Kategori */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold">
                Kategori <span className="text-red-400 text-xs">*</span>
              </label>
              <div className="relative">
                <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isLoadingCategories}
                  className={selectCls(!!selectedCategory, isLoadingCategories)}>
                  <option value="" className="bg-[#0f0f1a]">
                    {isLoadingCategories ? "Memuat kategori..." : "Pilih Kategori"}
                  </option>
                  {(categories as any[] | undefined)?.map((cat) => (
                    <option key={cat.name} value={cat.name} className="bg-[#0f0f1a]">{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Layanan */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold">
                Layanan <span className="text-red-400 text-xs">*</span>
              </label>
              <div className="relative">
                <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}
                  disabled={!selectedCategory || isLoadingServices}
                  className={selectCls(!!selectedServiceId, !selectedCategory || isLoadingServices)}>
                  <option value="" className="bg-[#0f0f1a]">
                    {!selectedCategory ? "Pilih kategori dulu" : isLoadingServices ? "Memuat layanan..." : filteredServices.length === 0 ? "Tidak ada layanan" : "Pilih Layanan"}
                  </option>
                  {filteredServices.map((svc: any) => (
                    <option key={svc.id} value={String(svc.id)} className="bg-[#0f0f1a]">
                      {"#" + svc.id + " — " + svc.name + " (" + formatRupiah(svc.price) + "/1K)"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Detail layanan */}
            {selectedService && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(selectedService.category || selectedService.name)}
                  <span className="text-xs font-semibold text-primary">{selectedService.category}</span>
                </div>
                <div className="text-sm font-medium leading-tight">{selectedService.name}</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: "Harga/1000", value: formatRupiah(selectedService.price) },
                    { label: "Min Order",  value: (selectedService.minOrder ?? 0).toLocaleString("id-ID") },
                    { label: "Max Order",  value: (selectedService.maxOrder ?? 0).toLocaleString("id-ID") },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-xs font-bold mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold">
                Target <span className="text-red-400 text-xs">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={orderLink} onChange={(e) => setOrderLink(e.target.value)}
                  placeholder="Username / Link"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:outline-none text-sm transition-all" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                Pastikan akun/postingan bersifat <strong className="text-foreground ml-1">publik</strong>
              </p>
            </div>

            {/* Jumlah */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold">
                Jumlah <span className="text-red-400 text-xs">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder={selectedService ? ("Min " + (selectedService.minOrder ?? 0).toLocaleString("id-ID")) : "0"}
                  min={selectedService?.minOrder ?? 1}
                  max={selectedService?.maxOrder ?? 999999}
                  className="w-full pl-10 pr-16 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:outline-none text-sm transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-white/10 px-2 py-1 rounded-lg">unit</span>
              </div>
              {selectedService && (
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000, 10000]
                    .filter(q => q >= (selectedService.minOrder ?? 0) && q <= (selectedService.maxOrder ?? 999999))
                    .slice(0, 5)
                    .map(q => (
                      <button key={q} onClick={() => setOrderQuantity(String(q))}
                        className={qtyBtnCls(qty === q)}>
                        {q >= 1000 ? (q / 1000) + "K" : q}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Total Harga */}
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Harga:</span>
              <span className={totalPrice > 0 ? "text-xl font-bold text-primary" : "text-xl font-bold text-muted-foreground"}>
                {totalPrice > 0 ? formatRupiah(totalPrice) : "Rp 0"}
              </span>
            </div>

            {/* Saldo check */}
            {totalPrice > 0 && (
              <div className={balanceCls}>
                <span className="text-muted-foreground">Saldo kamu:</span>
                <span className={balanceTextCls}>
                  {canAfford && <CheckCircle2 className="w-3 h-3" />}
                  {!canAfford && <AlertCircle className="w-3 h-3" />}
                  {formatRupiah(balance)}
                  {!canAfford && <span className="text-xs">(kurang {formatRupiah(totalPrice - balance)})</span>}
                </span>
              </div>
            )}

            {/* Order Button */}
            <button onClick={handleOrder}
              disabled={createOrderMutation.isPending || !selectedServiceId || !orderLink || !orderQuantity}
              className="w-full py-4 rounded-xl shimmer-btn text-white font-bold text-base neon-glow hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2">
              {createOrderMutation.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses Order...</>
                : <><ShoppingCart className="w-5 h-5" /> Order</>}
            </button>
          </div>

          <div className="glass rounded-xl border border-white/10 p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan Penting</div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>Pastikan akun/postingan target bersifat <strong className="text-foreground">publik</strong> sebelum order</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>Order yang sudah diproses <strong className="text-foreground">tidak bisa dibatalkan</strong></li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>Proses pengerjaan <strong className="text-foreground">1–24 jam</strong> tergantung layanan</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>Jika ada masalah, buka tiket di menu <strong className="text-foreground">Bantuan</strong></li>
            </ul>
          </div>
        </div>
      </AppLayout>
    );
  }
  