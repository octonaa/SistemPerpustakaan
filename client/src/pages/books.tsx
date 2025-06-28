import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import MainLayout from "@/components/layout/main-layout";
import BookForm from "@/components/books/book-form";
import type { Book } from "@shared/schema";

export default function Books() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["/api/books", { search: searchQuery }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey as [string, { search?: string }];
      const searchParams = new URLSearchParams();
      if (params?.search) {
        searchParams.set("search", params.search);
      }
      const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;
      return fetch(fullUrl, { credentials: "include" }).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Berhasil",
        description: "Buku berhasil dihapus",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal menghapus buku",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBook(null);
  };

  return (
    <MainLayout title="Data Buku" subtitle="Kelola koleksi buku perpustakaan">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Buku</h1>
          <p className="mt-2 text-sm text-gray-700">Kelola koleksi buku perpustakaan</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setShowForm(true)} className="bg-library-blue hover:bg-library-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Buku
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
                placeholder="Cari berdasarkan judul, penulis, atau penerbit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card className="shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Buku</h3>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nomor Buku</TableHead>
                  <TableHead>Bidang Pustaka</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Penerbit</TableHead>
                  <TableHead>Tahun Terbit</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Jumlah Buku</TableHead>
                  <TableHead>Tersedia</TableHead>
                  <TableHead>Opsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      Tidak ada data buku
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book: Book, index: number) => (
                    <TableRow key={book.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{book.bookNumber}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{book.title}</TableCell>
                      <TableCell>{book.type}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.publisher}</TableCell>
                      <TableCell>{book.publishYear}</TableCell>
                      <TableCell>{new Date(book.entryDate!).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{book.quantity}</TableCell>
                      <TableCell>{book.availableQuantity}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(book)}
                            className="text-library-blue hover:text-library-blue/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
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

      {/* Book Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "Edit Buku" : "Tambah Buku Baru"}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            book={editingBook}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
