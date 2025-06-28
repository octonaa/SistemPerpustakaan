import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Check, Trash2, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
  const [showForm, setShowForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["/api/loans"],
  });

  const returnMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/loans/${id}/return`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: "Buku berhasil dikembalikan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal mengembalikan buku",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Berhasil",
        description: "Data peminjaman berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus data peminjaman",
        variant: "destructive",
      });
    },
  });

  const handleReturn = (id: number) => {
    if (confirm("Apakah Anda yakin ingin mengembalikan buku ini?")) {
      returnMutation.mutate(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data peminjaman ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (status === "returned") {
      return <Badge className="bg-success-green text-white">Selesai</Badge>;
    } else if (status === "active" && now > due) {
      return <Badge className="bg-red-500 text-white">Terlambat</Badge>;
    } else {
      return <Badge className="bg-warning-orange text-white">Aktif</Badge>;
    }
  };

  const filteredLoans = loans.filter((loan: LoanWithRelations) => {
    const matchesSearch = 
      loan.member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.book.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && loan.status === "active") ||
      (statusFilter === "returned" && loan.status === "returned") ||
      (statusFilter === "overdue" && loan.status === "active" && new Date() > new Date(loan.dueDate));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Data Peminjaman" subtitle="Kelola transaksi peminjaman buku">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Peminjaman</h1>
          <p className="mt-2 text-sm text-gray-700">Kelola transaksi peminjaman buku</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setShowForm(true)} className="bg-library-blue hover:bg-library-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Peminjaman
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardContent className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama peminjam atau judul buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
                <SelectItem value="returned">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card className="shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Peminjaman</h3>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nomor Peminjaman</TableHead>
                  <TableHead>Nama Peminjam</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead>Waktu Pinjam</TableHead>
                  <TableHead>Batas Waktu</TableHead>
                  <TableHead>Waktu Kembali</TableHead>
                  <TableHead>Denda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Tidak ada data peminjaman
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan: LoanWithRelations, index: number) => (
                    <TableRow key={loan.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                      <TableCell>{loan.member.fullName}</TableCell>
                      <TableCell className="max-w-xs truncate">{loan.book.title}</TableCell>
                      <TableCell>{new Date(loan.loanDate!).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{new Date(loan.dueDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        {loan.returnDate 
                          ? new Date(loan.returnDate).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(loan.fine || 0)}</TableCell>
                      <TableCell>
                        {getStatusBadge(loan.status, loan.dueDate.toString())}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-library-blue hover:text-library-blue/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {loan.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReturn(loan.id)}
                              className="text-success-green hover:text-success-green/80"
                              disabled={returnMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(loan.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
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

      {/* Loan Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Peminjaman Baru</DialogTitle>
          </DialogHeader>
          <LoanForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
