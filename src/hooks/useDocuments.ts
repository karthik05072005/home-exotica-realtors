import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type DocumentType = 
  | "aadhar" 
  | "pan" 
  | "address_proof" 
  | "booking_form" 
  | "sale_agreement" 
  | "payment_receipt" 
  | "property_document" 
  | "other";

export interface Document {
  id: string;
  user_id: string;
  lead_id: string | null;
  customer_id: string | null;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  file_path: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentInput {
  lead_id?: string;
  customer_id?: string;
  document_type: DocumentType;
  document_name: string;
  file: File;
  notes?: string;
}

export function useDocuments(leadId?: string, customerId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", user?.id, leadId, customerId],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }
      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: DocumentInput) => {
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = input.file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, input.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Save document record
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          lead_id: input.lead_id || null,
          customer_id: input.customer_id || null,
          document_type: input.document_type,
          document_name: input.document_name,
          file_url: urlData.publicUrl,
          file_path: filePath,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
