import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Book, Users, Download, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: { reportType: string; title: string }) => {
      return await apiRequest("POST", "/api/reports", reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Berhasil",
        description: "Laporan berhasil dibuat",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal membuat laporan",
        variant: "destructive",
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Berhasil",
        description: "Laporan berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus laporan",
        variant: "destructive",
      });
    },
  });

  const reportTypes = [
    {
      type: "monthly_loans",
      title: "Laporan Peminjaman Bulanan",
      description: "Laporan transaksi peminjaman per bulan",
      icon: CalendarDays,
      bgColor: "bg-library-blue",
    },
    {
      type: "monthly_fines",
      title: "Laporan Denda Bulanan",
      description: "Laporan denda keterlambatan per bulan",
      icon: DollarSign,
      bgColor: "bg-success-green",
    },
    {
      type: "books",
      title: "Laporan Buku",
      description: "Laporan inventaris dan status buku",
      icon: Book,
      bgColor: "bg-blue-500",
    },
    {
      type: "new_members",
      title: "Laporan Anggota Baru",
      description: "Laporan pendaftaran anggota baru",
      icon: Users,
      bgColor: "bg-accent-purple",
    },
  ];

  const handleGenerateReport = (reportType: string, title: string) => {
    createReportMutation.mutate({ reportType, title });
  };

  const handleDeleteReport = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      deleteReportMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success-green text-white">Selesai</Badge>;
      case "pending":
        return <Badge className="bg-warning-orange text-white">Sedang Proses</Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Laporan" subtitle="Generate dan kelola laporan sistem perpustakaan">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Laporan</h1>
          <p className="mt-2 text-sm text-gray-700">Generate dan kelola laporan sistem perpustakaan</p>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        {reportTypes.map((report) => (
          <Card key={report.type} className="overflow-hidden shadow-sm border border-gray-200">
            <CardContent className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                    <report.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => handleGenerateReport(report.type, report.title)}
                  disabled={createReportMutation.isPending}
                  className={`w-full ${report.bgColor} hover:opacity-90`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {createReportMutation.isPending ? "Generating..." : "Generate Laporan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Laporan Terbaru</h3>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Jenis Laporan</TableHead>
                  <TableHead>Tanggal Generate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Belum ada laporan yang dibuat
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: Report, index: number) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{new Date(report.generatedAt!).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={report.status !== "completed"}
                            className={`${
                              report.status === "completed"
                                ? "text-library-blue hover:text-library-blue/80"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteReportMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
}
