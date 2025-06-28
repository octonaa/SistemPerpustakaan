import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { insertMemberSchema, type Member, type InsertMember } from "@shared/schema";

interface MemberFormProps {
  member?: Member | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertMember>({
    resolver: zodResolver(insertMemberSchema),
    defaultValues: {
      identityNumber: member?.identityNumber || "",
      identityType: member?.identityType || "NIM",
      fullName: member?.fullName || "",
      birthDate: member?.birthDate || undefined,
      class: member?.class || "",
      address: member?.address || "",
      phone: member?.phone || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertMember) => {
      if (member) {
        return await apiRequest("PUT", `/api/members/${member.id}`, data);
      } else {
        return await apiRequest("POST", "/api/members", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: member ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan",
      });
      onSuccess();
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
        description: member ? "Gagal memperbarui anggota" : "Gagal menambahkan anggota",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMember) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identityNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Identitas</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Identitas</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis identitas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NIM">NIM</SelectItem>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="SIM">SIM</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Lahir</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas</FormLabel>
              <FormControl>
                <Input {...field} placeholder="S1 2" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
