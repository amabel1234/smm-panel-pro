import { Link, useLocation } from "wouter";
  import { useAuth } from "@/contexts/AuthContext";
  import {
    LayoutDashboard, ShoppingCart, History, CreditCard, Wallet,
    Phone, Ticket, Users, User, ShieldAlert, LogOut, Menu, Bell,
    ChevronRight, Zap, MessageCircle } from "lucide-react";
  import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
  import { formatRupiah } from "@/lib/utils";
  import { useState } from "react";

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard",        href: "/dashboard" },
    { icon: ShoppingCart,    label: "Order Layanan",     href: "/services" },
    { icon: History,         label: "Riwayat Order",     href: "/orders" },
    { icon: CreditCard,      label: "Top Up Saldo",      href: "/deposit" },
    { icon: Wallet,          label: "Transaksi",         href: "/transactions" },
    { icon: Phone,           label: "Nomor Virtual",     href: "/nokos" },
    { icon: Ticket,          label: "Bantuan / Tiket",   href: "/tickets" },
    { icon: Users,           label: "Referral",          href: "/referral" },
    { icon: MessageCircle,   label: "Kontak Owner",      href: "/contact" },
  ];

  const adminItems = [
    { icon: ShieldAlert, label: "Admin Dashboard",  href: "/admin" },
    { icon: Users,       label: "Kelola Pengguna",  href: "/admin/users" },
    { icon: ShoppingCart, label: "Kelola Layanan", href: "/admin/services" },
    { icon: History,     label: "Kelola Order",     href: "/admin/orders" },
    { icon: CreditCard,  label: "Kelola Deposit",   href: "/admin/deposits" },
  ];

  function NavItem({ item, active }: { item: typeof navItems[0]; active: boolean }) {
    return (
      <Link href={item.href}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          active
            ? "bg-primary/15 text-primary border border-primary/25"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        }`}>
          <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
          <span>{item.label}</span>
          {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
        </div>
      </Link>
    );
  }

  function SidebarContent({ location, user, isAdmin, logout }: any) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center neon-glow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg font-display gradient-text-blue">SMM Pro</span>
            </div>
          </Link>
        </div>

        {/* Balance card */}
        <div className="p-3">
          <Link href="/deposit">
            <div className="glass rounded-xl p-3 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="text-xs text-muted-foreground mb-0.5">Saldo Kamu</div>
              <div className="text-lg font-bold text-primary">{formatRupiah(user?.balance || 0)}</div>
              <div className="text-xs text-primary/60 mt-0.5">+ Top Up →</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <div className="text-xs font-semibold text-muted-foreground/50 px-3 py-2 uppercase tracking-wider">Menu</div>
          {navItems.map(item => (
            <NavItem key={item.href} item={item} active={location === item.href} />
          ))}

          {isAdmin && (
            <>
              <div className="text-xs font-semibold text-muted-foreground/50 px-3 py-2 uppercase tracking-wider mt-3">Admin</div>
              {adminItems.map(item => (
                <NavItem key={item.href} item={item} active={location === item.href} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>
    );
  }

  export function AppLayout({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();
    const { user, logout, isAdmin } = useAuth();
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleLogout = () => {
      logout();
      window.location.href = "/";
    };

    return (
      <div className="min-h-screen mesh-bg flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 xl:w-64 flex-col fixed inset-y-0 left-0 z-30 bg-background/80 backdrop-blur-xl border-r border-white/10">
          <SidebarContent location={location} user={user} isAdmin={isAdmin} logout={handleLogout} />
        </aside>

        {/* Main */}
        <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
            {/* Mobile: hamburger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-background/95 backdrop-blur-xl border-white/10">
                <SidebarContent location={location} user={user} isAdmin={isAdmin} logout={handleLogout} />
              </SheetContent>
            </Sheet>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold font-display gradient-text-blue text-sm">SMM Pro</span>
            </div>
            
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Balance mobile */}
              <Link href="/deposit">
                <div className="lg:hidden px-3 py-1.5 rounded-lg glass border border-primary/20 text-xs font-semibold text-primary cursor-pointer">
                  {formatRupiah(user?.balance || 0)}
                </div>
              </Link>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="gradient-bg text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass border-white/10">
                  <div className="px-3 py-2">
                    <div className="font-medium text-sm truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><div className="flex items-center gap-2 cursor-pointer w-full"><User className="w-4 h-4" /> Profil Saya</div></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tickets"><div className="flex items-center gap-2 cursor-pointer w-full"><Ticket className="w-4 h-4" /> Bantuan</div></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }
  