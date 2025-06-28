import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Remove auto-redirect to login - just show auth message in App.tsx instead

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-full">
      <Sidebar />
      <div className="pl-60">
        <Header title={title} subtitle={subtitle} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
