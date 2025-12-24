import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  whatsapp_number: string | null;
  city: string | null;
  occupation: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  whatsapp_number?: string;
  city?: string;
  occupation?: string;
  company_name?: string;
}

export function useCustomers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["customers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!user,
  });
}

export function useAddCustomer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (customer: CustomerInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          address: customer.address || null,
          whatsapp_number: customer.whatsapp_number || null,
          city: customer.city || null,
          occupation: customer.occupation || null,
          company_name: customer.company_name || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomerInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCustomerFollowUps(customerId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-follow-ups', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!customerId,
  });
}