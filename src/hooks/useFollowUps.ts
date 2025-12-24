import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type FollowUpType = "call" | "whatsapp" | "visit" | "meeting";
export type FollowUpStatus = "pending" | "done" | "missed";

export interface FollowUp {
  id: string;
  user_id: string;
  lead_id: string | null;
  customer_id: string | null;
  customer_name: string;
  phone: string;
  scheduled_at: string;
  notes: string | null;
  completed: boolean;
  follow_up_type: FollowUpType;
  status: FollowUpStatus;
  auto_reminder: boolean;
  created_at: string;
}

export interface FollowUpInput {
  customer_name: string;
  phone: string;
  scheduled_at: string;
  notes?: string;
  lead_id?: string;
  customer_id?: string;
  follow_up_type?: FollowUpType;
  auto_reminder?: boolean;
}

export function useFollowUps() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["follow_ups", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as FollowUp[];
    },
    enabled: !!user,
  });
}

export function useAddFollowUp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followUp: FollowUpInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("follow_ups")
        .insert({
          user_id: user.id,
          customer_name: followUp.customer_name,
          phone: followUp.phone,
          scheduled_at: followUp.scheduled_at,
          notes: followUp.notes || null,
          lead_id: followUp.lead_id || null,
          customer_id: followUp.customer_id || null,
          follow_up_type: followUp.follow_up_type || "call",
          auto_reminder: followUp.auto_reminder !== false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow_ups"] });
      toast.success("Follow-up scheduled!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FollowUpInput> & { id: string; status?: FollowUpStatus; completed?: boolean }) => {
      const { data, error } = await supabase
        .from("follow_ups")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow_ups"] });
      toast.success("Follow-up updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleFollowUpComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from("follow_ups")
        .update({ 
          completed,
          status: completed ? "done" : "pending"
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow_ups"] });
      toast.success("Follow-up updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
