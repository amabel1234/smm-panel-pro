import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListServices, useListServiceCategories, useCreateOrder, useGetMe } from "@workspace/api-client-react";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Info, CheckCircle2, Link as LinkIcon, Hash, AlertCircle, Search, ChevronDown, Star, Zap, Clock, RefreshCw } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiTelegram, SiWhatsapp, SiX, SiSpotify } from "react-icons/si";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function getPlatformIcon(name: string, cls = "w-4 h-4") {
  const n = (name || "").toLowerCase();
  if (n.includes("instagram")) return <SiInstagram className={cls + " text-pink-400"} />;
  if (n.includes("tiktok"))    return <SiTiktok    className={cls + " text-white"} />;
  if (n.includes("youtube"))   return <SiYoutube   className={cls + " text-red-400"} />;
  if (n.includes("facebook"))  return <SiFacebook  className={cls + " text-blue-400"} />;
  if (n.includes("telegram"))  return <SiTelegram  className={cls + " text-sky-400"} />;
  if (n.includes("whatsapp"))  return <SiWhatsapp  className={cls + " text-green-400"} />;
  if (n.includes("twitter") || n.includes("x ")) return <SiX className={cls + " text-white"} />;
  if (n.includes("spotify"))   return <SiSpotify   className={cls + " text-green-500"} />;
  return null;
}

function getPlatformGradient(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("instagram")) return "from-pink-500/20 to-purple-500/20 border-pink-500/30";
  if (n.includes("tiktok"))    return "from-gray-700/20 to-gray-900/20 border-white/20";
  if (n.includes("youtube"))   return "from-red-500/20 to-red-700/20 border-red-500/30";
  if (n.includes("facebook"))  return "from-blue-500/20 to-blue-700/20 border-blue-500/30";
  if (n.includes("telegram"))  return "from-sky-400/20 to-sky-600/20 border-sky-500/30";
  if (n.includes("whatsapp"))  return "from-green-500/20 to-green-700/20 border-green-500/30";
  if (n.includes("spotify"))   return "from-green-500/20 to-green-700/20 border-green-500/30";
  return "from-primary/20 to-purple-500/20 border-primary/30";
}

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [orderLink, setOrderLink] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  const { data: categoriesRaw, isLoading: isLoadingCategories } = useListServiceCategories();
  const { data: allServices, isLoading: isLoadingServices } = useListServices({});
  const { data: me } = useGetMe();
  const createOrderMutation = useCreateOrder();

  const categories = useMemo(() => {
    const cats = categoriesRaw as any[] | undefined;
    if (cats && cats.length > 0) return cats;
    if (!allServices) return [];
    const unique = [...new Set((allServices as any[]).map((s: any) => s.category))];
    return unique.map((c: string) => ({ name: c, platform: c, icon: "" }));
  }, [categoriesRaw, allServices]);

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

  const selectedCategoryObj = useMemo(() =>
    (categories as any[]).find((c: any) =>
      c.name?.toLowerCase() === selectedCategory.toLowerCase() ||
      c.platform?.toLowerCase() === selectedCategory.toLowerCase()
    ),
    [categories, selectedCategory]
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
    setOrderQuantity("");
    setCatOpen(false);
  };

  const handleServiceChange = (svcId: string) => {
    setSelectedServiceId(svcId);
    setOrderQuantity("");
    setSvcOpen(false);
  };

  const handleOrder = () => {
    if (!selectedServiceId) { toast.error("Pilih layanan terlebih dahulu"); return; }
    if (!orderLink.trim()) { toast.error("Masukkan username / link target"); return; }
    if (!qty || qty < (selectedService?.minOrder ?? 1)) {
      toast.error(`Jumlah minimum: ${(selectedService?.minOrder ?? 1).toLocaleString("id-ID")}`); return;
    }
    if (qty > (selectedService?.maxOrder ?? 999999)) {
      toast.error(`Jumlah maksimum: ${(selectedService?.maxOrder ?? 999999).toLocaleString("id-ID")}`); return;
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
        onError: (err: any) => toast.error(err?.data?.error || err?.message || "Gagal membuat order"),
      }
    );
  };

  const qtyBtnCls = (active: boolean) =>
    "flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all " +
    (active ? "gradient-bg text-white border-transparent" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10");

  const triggerCls = (hasValue: boolean, disabled: boolean) =>
    `w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/5 border text-sm transition-all focus:outline-none text-left ${
      hasValue ? "border-primary/50 text-foreground" : "border-white/10 text-muted-foreground"
    } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-white/20 cursor-pointer"}`;

  return (
    <AppLayout>
      <div className="space-y-4 max-w-xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">Buat Order</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Isi form di bawah untuk mulai order</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-5 space-y-5">

          {/* Kategori Combobox */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-semibold">
              Kategori <span className="text-red-400 text-xs">*</span>
            </label>
            <Popover open={catOpen} onOpenChange={isLoadingCategories ? undefined : setCatOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isLoadingCategories}
                  className={triggerCls(!!selectedCategory, isLoadingCategories)}
                >
                  <span className="flex items-center gap-2">
                    {selectedCategoryObj
                      ? <>
                          {selectedCategoryObj.icon && <span>{selectedCategoryObj.icon}</span>}
                          {getPlatformIcon(selectedCategoryObj.platform || selectedCategoryObj.name)}
                          <span>{selectedCategoryObj.name}</span>
                        </>
                      : <span>{isLoadingCategories ? "Memuat..." : "Pilih Kategori"}</span>
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 bg-[#0f1623] border-white/10"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                align="start"
              >
                <Command className="bg-transparent">
                  <div className="flex items-center border-b border-white/10 px-3">
                    <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                    <CommandInput
                      placeholder="Cari kategori..."
                      className="border-0 focus:ring-0 bg-transparent text-sm h-10 placeholder:text-muted-foreground"
                    />
                  </div>
                  <CommandList className="max-h-60 overflow-y-auto">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      Kategori tidak ditemukan
                    </CommandEmpty>
                    <CommandGroup>
                      {(categories as any[]).map((cat: any) => (
                        <CommandItem
                          key={cat.name}
                          value={cat.name}
                          onSelect={() => handleCategoryChange(cat.name)}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/5 data-[selected=true]:bg-primary/10"
                        >
                          {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                          {getPlatformIcon(cat.platform || cat.name)}
                          <span className="flex-1 text-sm">{cat.name}</span>
                          {(cat.serviceCount ?? 0) > 0 && (
                            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                              {cat.serviceCount}
                            </span>
                          )}
                          {selectedCategory === cat.name && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Layanan Combobox */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-semibold">
              Layanan <span className="text-red-400 text-xs">*</span>
            </label>
            <Popover
              open={svcOpen}
              onOpenChange={(!selectedCategory || isLoadingServices || filteredServices.length === 0) ? undefined : setSvcOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!selectedCategory || isLoadingServices}
                  className={triggerCls(!!selectedServiceId, !selectedCategory || isLoadingServices)}
                >
                  <span className="truncate text-left">
                    {!selectedCategory
                      ? "Pilih kategori dulu"
                      : selectedService
                        ? `#${selectedService.id} — ${selectedService.name}`
                        : isLoadingServices
                          ? "Memuat layanan..."
                          : filteredServices.length === 0
                            ? "Tidak ada layanan tersedia"
                            : "Pilih Layanan"
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${svcOpen ? "rotate-180" : ""}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 bg-[#0f1623] border-white/10"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                align="start"
              >
                <Command className="bg-transparent">
                  <div className="flex items-center border-b border-white/10 px-3">
                    <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                    <CommandInput
                      placeholder="Cari layanan..."
                      className="border-0 focus:ring-0 bg-transparent text-sm h-10 placeholder:text-muted-foreground"
                    />
                  </div>
                  <CommandList className="max-h-72 overflow-y-auto">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      Layanan tidak ditemukan
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredServices.map((svc: any) => (
                        <CommandItem
                          key={svc.id}
                          value={`${svc.id} ${svc.name}`}
                          onSelect={() => handleServiceChange(String(svc.id))}
                          className="flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-white/5 data-[selected=true]:bg-primary/10"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground font-mono">#{svc.id}</div>
                            <div className="text-sm font-medium leading-snug">{svc.name}</div>
                            <div className="text-xs text-primary mt-0.5">{formatRupiah(svc.price)}/1K</div>
                          </div>
                          {String(selectedServiceId) === String(svc.id) && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Detail layanan */}
          {selectedService && (
            <div className={`rounded-xl bg-gradient-to-br ${getPlatformGradient(selectedService.category || selectedService.name)} border p-4 space-y-3`}>
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedService.category || selectedService.name)}
                <span className="text-xs font-semibold text-primary capitalize">{selectedService.category}</span>
                {selectedService.refillAvailable && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                    <RefreshCw className="w-2.5 h-2.5" /> Refill
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold leading-tight">{selectedService.name}</div>
              {selectedService.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{selectedService.description}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Harga/1000", value: formatRupiah(selectedService.price), icon: <Star className="w-3 h-3 text-yellow-400" /> },
                  { label: "Min Order",  value: (selectedService.minOrder ?? 0).toLocaleString("id-ID"), icon: <Hash className="w-3 h-3 text-blue-400" /> },
                  { label: "Kecepatan", value: selectedService.avgCompletionTime || "1-24 jam", icon: <Clock className="w-3 h-3 text-green-400" /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-xs font-bold mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1">Target <span className="text-red-400 text-xs">*</span></span>
              {selectedService && <span className="text-xs text-muted-foreground font-normal">username / URL</span>}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={orderLink}
                onChange={(e) => setOrderLink(e.target.value)}
                placeholder={selectedService ? `Link/username ${selectedService.category}` : "Username / Link"}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:outline-none text-sm transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Pastikan akun/postingan bersifat <strong className="text-foreground ml-1">publik</strong>
            </p>
          </div>

          {/* Jumlah */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1">Jumlah <span className="text-red-400 text-xs">*</span></span>
              {selectedService && (
                <span className="text-xs text-muted-foreground font-normal">
                  {(selectedService.minOrder ?? 0).toLocaleString("id-ID")} – {(selectedService.maxOrder ?? 0).toLocaleString("id-ID")}
                </span>
              )}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder={selectedService ? `Min ${(selectedService.minOrder ?? 0).toLocaleString("id-ID")}` : "0"}
                min={selectedService?.minOrder ?? 1}
                max={selectedService?.maxOrder ?? 999999}
                className="w-full pl-10 pr-16 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:outline-none text-sm transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-white/10 px-2 py-1 rounded-lg">unit</span>
            </div>
            {selectedService && (
              <div className="flex gap-2">
                {[100, 500, 1000, 5000, 10000, 50000]
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
            <div className={`rounded-xl px-4 py-2.5 flex items-center justify-between text-xs ${
              canAfford ? "bg-green-400/5 border border-green-400/20" : "bg-red-400/5 border border-red-400/20"
            }`}>
              <span className="text-muted-foreground">Saldo kamu:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${canAfford ? "text-green-400" : "text-red-400"}`}>
                {canAfford ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {formatRupiah(balance)}
                {!canAfford && <span className="opacity-70">(kurang {formatRupiah(totalPrice - balance)})</span>}
              </span>
            </div>
          )}

          {/* Order Button */}
          <button
            onClick={handleOrder}
            disabled={createOrderMutation.isPending || !selectedServiceId || !orderLink || !orderQuantity}
            className="w-full py-4 rounded-xl shimmer-btn text-white font-bold text-base neon-glow hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {createOrderMutation.isPending
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses Order...</>
              : <><ShoppingCart className="w-5 h-5" /> Order Sekarang</>}
          </button>
        </div>

        {/* Catatan */}
        <div className="glass rounded-xl border border-white/10 p-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary" /> Catatan Penting
          </div>
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
