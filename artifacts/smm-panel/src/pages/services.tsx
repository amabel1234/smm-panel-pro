import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListServices, useListServiceCategories, useCreateOrder } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Heart, Loader2 } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiTelegram, SiWhatsapp, SiX, SiSpotify } from "react-icons/si";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [orderLink, setOrderLink] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1000);

  const { data: services, isLoading: isLoadingServices } = useListServices({ 
    search: search || undefined,
    category: selectedCategory || undefined
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useListServiceCategories();
  const createOrderMutation = useCreateOrder();

  const handleOrderClick = (service: any) => {
    setSelectedService(service);
    setOrderQuantity(Math.max(service.minOrder, Math.min(1000, service.maxOrder)));
    setOrderLink("");
    setOrderModalOpen(true);
  };

  const handleCreateOrder = () => {
    if (!orderLink) {
      toast.error("Please enter a link");
      return;
    }
    
    createOrderMutation.mutate({
      data: {
        serviceId: selectedService.id,
        link: orderLink,
        quantity: orderQuantity
      }
    }, {
      onSuccess: () => {
        toast.success("Order created successfully!");
        setOrderModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create order");
      }
    });
  };

  const calculatePrice = () => {
    if (!selectedService) return 0;
    return (selectedService.price / 1000) * orderQuantity;
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return <SiInstagram className="text-pink-500" />;
    if (p.includes("tiktok")) return <SiTiktok className="text-white" />;
    if (p.includes("youtube")) return <SiYoutube className="text-red-500" />;
    if (p.includes("facebook")) return <SiFacebook className="text-blue-500" />;
    if (p.includes("telegram")) return <SiTelegram className="text-blue-400" />;
    if (p.includes("whatsapp")) return <SiWhatsapp className="text-green-500" />;
    if (p.includes("twitter") || p.includes("x")) return <SiX className="text-white" />;
    if (p.includes("spotify")) return <SiSpotify className="text-green-500" />;
    return null;
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <Card className="glass border-primary/20 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="flex flex-col p-2 space-y-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${!selectedCategory ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    All Services
                  </button>
                  {isLoadingCategories ? (
                    <div className="space-y-2 p-2">
                      {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : (
                    categories?.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${selectedCategory === cat.name ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center">{getPlatformIcon(cat.platform)}</span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-background/50">{cat.serviceCount}</Badge>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-3xl font-bold font-display">Services</h1>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search services..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 glass"
              />
            </div>
          </div>
          
          {isLoadingServices ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : services?.length === 0 ? (
            <div className="text-center p-12 glass rounded-xl">
              <p className="text-muted-foreground text-lg">No services found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {services?.map(service => (
                <Card key={service.id} className="glass hover-elevate transition-all border-border/50 hover:border-primary/30 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center shrink-0">
                          {getPlatformIcon(service.platform)}
                        </div>
                        <CardTitle className="text-base leading-tight line-clamp-2">{service.name}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Price / 1000</p>
                        <p className="font-semibold text-primary">{formatRupiah(service.price)}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Min / Max</p>
                        <p className="font-medium">{service.minOrder} / {service.maxOrder}</p>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{service.description}</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-border/30 mt-auto flex justify-between items-center bg-muted/10">
                    <div className="flex gap-2 py-3">
                      {service.refillAvailable && <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">Refill</Badge>}
                      <Badge variant="outline" className="text-xs">{service.platform}</Badge>
                    </div>
                    <Button onClick={() => handleOrderClick(service)} size="sm" className="neon-glow text-xs">Order Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="glass border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
            <DialogDescription className="line-clamp-2 mt-2">
              {selectedService?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="link">Target Link</Label>
              <Input 
                id="link" 
                placeholder="https://..." 
                value={orderLink}
                onChange={(e) => setOrderLink(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label htmlFor="quantity">Quantity</Label>
                <span className="text-lg font-bold text-primary">{orderQuantity}</span>
              </div>
              <Slider
                id="quantity"
                min={selectedService?.minOrder || 10}
                max={selectedService?.maxOrder || 10000}
                step={10}
                value={[orderQuantity]}
                onValueChange={(v) => setOrderQuantity(v[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {selectedService?.minOrder}</span>
                <span>Max: {selectedService?.maxOrder}</span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border flex justify-between items-center">
              <span className="font-medium">Total Charge:</span>
              <span className="text-xl font-bold text-primary neon-text">{formatRupiah(calculatePrice())}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} disabled={createOrderMutation.isPending} className="neon-glow">
              {createOrderMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
