import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import MainLayout from "@/components/layout/main-layout";
import MemberForm from "@/components/members/member-form";
import type { Member } from "@shared/schema";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["/api/members", { search: searchQuery }],
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
      await apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Berhasil",
        description: "Anggota berhasil dihapus",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Tidak terotorisasi",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Gagal menghapus anggota",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  return (
    <MainLayout title="Data Anggota" subtitle="Kelola data anggota perpustakaan">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Anggota</h1>
          <p className="mt-2 text-sm text-gray-700">Kelola data anggota perpustakaan</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setShowForm(true)} className="bg-library-blue hover:bg-library-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Anggota
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
                placeholder="Cari berdasarkan nama, nomor anggota, atau alamat..."
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

      {/* Members Table */}
      <Card className="shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Anggota</h3>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nomor Anggota</TableHead>
                  <TableHead>Nomor Identitas</TableHead>
                  <TableHead>Jenis Identitas</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Nomor Telepon</TableHead>
                  <TableHead>Tanggal Pendaftaran</TableHead>
                  <TableHead>Opsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      Tidak ada data anggota
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member: Member, index: number) => (
                    <TableRow key={member.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{member.memberNumber}</TableCell>
                      <TableCell>{member.identityNumber}</TableCell>
                      <TableCell>{member.identityType}</TableCell>
                      <TableCell>{member.fullName}</TableCell>
                      <TableCell>{member.birthDate ? new Date(member.birthDate).toLocaleDateString('id-ID') : '-'}</TableCell>
                      <TableCell>{member.class || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{member.address || '-'}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                      <TableCell>{new Date(member.registrationDate!).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            className="text-library-blue hover:text-library-blue/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-accent-purple hover:text-accent-purple/80"
                          >
                            <Eye className="h-4 w-4" />
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

      {/* Member Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Anggota" : "Tambah Anggota Baru"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            member={editingMember}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
