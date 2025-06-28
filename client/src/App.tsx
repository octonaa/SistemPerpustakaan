import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import Members from "@/pages/members";
import Books from "@/pages/books";
import Loans from "@/pages/loans";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Perpustakaan-Atina
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sistem Manajemen Perpustakaan
            </p>
            <div className="mt-8">
              <a
                href="/api/login"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-library-blue hover:bg-library-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-library-blue"
              >
                Login Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthWrapper>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/members" component={Members} />
        <Route path="/books" component={Books} />
        <Route path="/loans" component={Loans} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </AuthWrapper>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
