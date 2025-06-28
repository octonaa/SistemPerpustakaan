import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Check, Book, Users } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsCards = [
    {
      title: "Dalam Peminjaman",
      value: stats?.activeLoans || 0,
      icon: Clock,
      bgColor: "bg-warning-orange",
    },
    {
      title: "Peminjaman Selesai", 
      value: stats?.completedLoans || 0,
      icon: Check,
      bgColor: "bg-success-green",
    },
    {
      title: "Jumlah Judul Buku",
      value: stats?.totalBooks || 0,
      icon: Book,
      bgColor: "bg-blue-500",
    },
    {
      title: "Jumlah Anggota",
      value: stats?.totalMembers || 0,
      icon: Users,
      bgColor: "bg-accent-purple",
    },
  ];

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Selamat datang di sistem manajemen perpustakaan"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((card, index) => (
          <Card key={index} className="overflow-hidden shadow-sm border border-gray-200">
            <CardContent className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <CardContent className="px-6 py-4">
          <div className="text-center py-8 text-gray-500">
            <Book className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Belum ada aktivitas terbaru</p>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
