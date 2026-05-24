import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Orders from "@/pages/orders";
import Deposit from "@/pages/deposit";
import Transactions from "@/pages/transactions";
import Nokos from "@/pages/nokos";
import Tickets from "@/pages/tickets";
import Notifications from "@/pages/notifications";
import Referral from "@/pages/referral";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminServices from "@/pages/admin/services";
import AdminOrders from "@/pages/admin/orders";
import AdminDeposits from "@/pages/admin/deposits";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>
      <div className="text-center z-10 relative">
        <h1 className="text-5xl font-bold gradient-text font-display">SMM Panel Pro</h1>
        <p className="mt-4 text-muted-foreground text-lg">Premium social media marketing panel.</p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-md neon-glow font-medium transition-transform hover:scale-105">Login</a>
          <a href="/register" className="px-6 py-2 bg-card border border-border text-card-foreground rounded-md glass font-medium transition-transform hover:scale-105">Register</a>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/services"><ProtectedRoute><Services /></ProtectedRoute></Route>
      <Route path="/orders"><ProtectedRoute><Orders /></ProtectedRoute></Route>
      <Route path="/deposit"><ProtectedRoute><Deposit /></ProtectedRoute></Route>
      <Route path="/transactions"><ProtectedRoute><Transactions /></ProtectedRoute></Route>
      <Route path="/nokos"><ProtectedRoute><Nokos /></ProtectedRoute></Route>
      <Route path="/tickets"><ProtectedRoute><Tickets /></ProtectedRoute></Route>
      <Route path="/notifications"><ProtectedRoute><Notifications /></ProtectedRoute></Route>
      <Route path="/referral"><ProtectedRoute><Referral /></ProtectedRoute></Route>
      <Route path="/profile"><ProtectedRoute><Profile /></ProtectedRoute></Route>
      
      <Route path="/admin"><AdminRoute><AdminDashboard /></AdminRoute></Route>
      <Route path="/admin/users"><AdminRoute><AdminUsers /></AdminRoute></Route>
      <Route path="/admin/services"><AdminRoute><AdminServices /></AdminRoute></Route>
      <Route path="/admin/orders"><AdminRoute><AdminOrders /></AdminRoute></Route>
      <Route path="/admin/deposits"><AdminRoute><AdminDeposits /></AdminRoute></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster theme="dark" position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
