import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Book, 
  ArrowRightLeft, 
  ChartBar,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Data Anggota", href: "/members", icon: Users },
  { name: "Data Buku", href: "/books", icon: Book },
  { name: "Data Peminjaman", href: "/loans", icon: ArrowRightLeft },
  { name: "Laporan", href: "/reports", icon: ChartBar },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 z-50 flex w-60 flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6">
        <div className="flex h-16 shrink-0 items-center">
          <BookOpen className="h-8 w-8 text-library-blue mr-3" />
          <h1 className="text-xl font-bold text-gray-900">Perpustakaan-Atina</h1>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-x-3 ${
                        isActive 
                          ? "bg-library-blue text-white hover:bg-library-blue/90" 
                          : "text-gray-700 hover:text-library-blue hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
