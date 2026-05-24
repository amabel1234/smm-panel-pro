import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  CreditCard,
  Wallet,
  Phone,
  Ticket,
  Bell,
  Users,
  User,
  ShieldAlert,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Services", href: "/services" },
  { icon: History, label: "Orders", href: "/orders" },
  { icon: CreditCard, label: "Deposit", href: "/deposit" },
  { icon: Wallet, label: "Transactions", href: "/transactions" },
  { icon: Phone, label: "Virtual Number", href: "/nokos" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: Users, label: "Referral", href: "/referral" },
];

const adminItems = [
  { icon: ShieldAlert, label: "Admin Dashboard", href: "/admin" },
  { icon: Users, label: "Manage Users", href: "/admin/users" },
  { icon: ShoppingCart, label: "Manage Services", href: "/admin/services" },
  { icon: History, label: "Manage Orders", href: "/admin/orders" },
  { icon: CreditCard, label: "Manage Deposits", href: "/admin/deposits" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const NavLinks = ({ items }: { items: typeof navItems }) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center neon-glow">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold gradient-text">SMM Pro</span>
        </div>

        <div className="mb-6 px-3 py-3 rounded-xl glass border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
          <p className="text-xl font-bold neon-text">
            {formatRupiah(user?.balance || 0)}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Menu
            </p>
            <NavLinks items={navItems} />
          </div>

          {isAdmin && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Admin
              </p>
              <NavLinks items={adminItems} />
            </div>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-card border-r-border">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center neon-glow">
                      <span className="text-primary-foreground font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">SMM Pro</span>
                  </div>
                  <nav className="flex-1 overflow-y-auto space-y-6">
                    <div>
                      <NavLinks items={navItems} />
                    </div>
                    {isAdmin && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                          Admin
                        </p>
                        <NavLinks items={adminItems} />
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold md:hidden">SMM Pro</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary neon-glow" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-20 pb-safe">
        {[
          { icon: LayoutDashboard, href: "/dashboard" },
          { icon: ShoppingCart, href: "/services" },
          { icon: History, href: "/orders" },
          { icon: CreditCard, href: "/deposit" },
          { icon: User, href: "/profile" },
        ].map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? "neon-text" : ""}`} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
