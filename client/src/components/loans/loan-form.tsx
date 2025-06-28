import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { insertLoanSchema, type InsertLoan, type Member, type Book } from "@shared/schema";

interface LoanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LoanForm({ onSuccess, onCancel }: LoanFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ["/api/members"],
  });

  const { data: books = [] } = useQuery({
    queryKey: ["/api/books"],
  });

  const form = useForm<InsertLoan>({
    resolver: zodResolver(insertLoanSchema),
    defaultValues: {
      memberId: undefined,
      bookId: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertLoan) => {
      return await apiRequest("POST", "/api/loans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: "Peminjaman berhasil ditambahkan",
      });
      onSuccess();
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
        description: "Gagal menambahkan peminjaman",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLoan) => {
    mutation.mutate(data);
  };

  const availableBooks = books.filter((book: Book) => book.availableQuantity > 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anggota</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member: Member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.fullName} ({member.memberNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buku</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih buku" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableBooks.map((book: Book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.title} - {book.author} (Tersedia: {book.availableQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p><strong>Informasi:</strong></p>
          <p>• Batas waktu peminjaman: 7 hari dari tanggal peminjaman</p>
          <p>• Denda keterlambatan: Rp 1.000 per hari</p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-library-blue hover:bg-library-blue/90"
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
