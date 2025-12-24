import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type LeadSource = "website" | "whatsapp" | "facebook" | "instagram" | "walkin" | "referral" | "broker" | "phone" | "manual" | "magicbricks" | "commonfloor" | "99acres" | "housing" | "sulekha";
export type LeadStatus = "new" | "contacted" | "site_visit" | "negotiation" | "booked" | "lost" | "followup" | "converted" | "closed";
export type LeadPriority = "hot" | "warm" | "cold";
export type LeadType = "buyer" | "seller" | "tenant" | "investor";
export type PropertyType = "apartment" | "villa" | "plot" | "commercial" | "office" | "shop" | "house";
export type Purpose = "buy" | "rent" | "lease";
export type Furnishing = "unfurnished" | "semi" | "fully";
export type Facing = "east" | "west" | "north" | "south" | "any";
export type TenantType = "family" | "bachelors" | "any";
export type PropertyCategory = "own" | "other_agent" | "sandya";

export interface Lead {
  id: string;
  user_id: string;
  customer_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields
  assigned_agent: string | null;
  lead_priority: LeadPriority;
  lead_type: LeadType;
  alternate_phone: string | null;
  address: string | null;
  city: string | null;
  occupation: string | null;
  company_name: string | null;
  // Property requirements
  property_type: PropertyType | null;
  purpose: Purpose;
  budget_min: number | null;
  budget_max: number | null;
  preferred_locations: string[] | null;
  bhk_requirement: string | null;
  carpet_area: string | null;
  furnishing: Furnishing | null;
  parking_required: boolean;
  floor_preference: string | null;
  facing: Facing | null;
  ready_to_move: boolean;
  expected_possession_date: string | null;
  // Tenant-specific fields
  tenant_type: TenantType | null;
  is_vegetarian: boolean | null;
  has_pets: boolean | null;
  visit_date: string | null;
  visit_time: string | null;
  property_category: PropertyCategory | null;
  possession_from: string | null;
}

export interface LeadInput {
  customer_name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  notes?: string;
  assigned_agent?: string;
  lead_priority?: LeadPriority;
  lead_type?: LeadType;
  alternate_phone?: string;
  address?: string;
  city?: string;
  occupation?: string;
  company_name?: string;
  property_type?: PropertyType;
  purpose?: Purpose;
  budget_min?: number;
  budget_max?: number;
  preferred_locations?: string[];
  bhk_requirement?: string;
  carpet_area?: string;
  furnishing?: Furnishing;
  parking_required?: boolean;
  floor_preference?: string;
  facing?: Facing;
  ready_to_move?: boolean;
  expected_possession_date?: string;
  // Tenant-specific fields
  tenant_type?: TenantType;
  is_vegetarian?: boolean;
  has_pets?: boolean;
  visit_date?: string;
  visit_time?: string;
  property_category?: PropertyCategory;
  possession_from?: string;
}

export function useLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useAddLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: LeadInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          customer_name: lead.customer_name,
          phone: lead.phone,
          email: lead.email || null,
          source: lead.source,
          notes: lead.notes || null,
          assigned_agent: lead.assigned_agent || null,
          lead_priority: lead.lead_priority || "warm",
          lead_type: lead.lead_type || "buyer",
          alternate_phone: lead.alternate_phone || null,
          address: lead.address || null,
          city: lead.city || null,
          occupation: lead.occupation || null,
          company_name: lead.company_name || null,
          property_type: lead.property_type || null,
          purpose: lead.purpose || "buy",
          budget_min: lead.budget_min || null,
          budget_max: lead.budget_max || null,
          preferred_locations: lead.preferred_locations || null,
          bhk_requirement: lead.bhk_requirement || null,
          carpet_area: lead.carpet_area || null,
          furnishing: lead.furnishing || null,
          parking_required: lead.parking_required || false,
          floor_preference: lead.floor_preference || null,
          facing: lead.facing || null,
          ready_to_move: lead.ready_to_move !== false,
          expected_possession_date: lead.expected_possession_date || null,
          tenant_type: lead.tenant_type || null,
          is_vegetarian: lead.is_vegetarian ?? null,
          has_pets: lead.has_pets ?? null,
          visit_date: lead.visit_date || null,
          visit_time: lead.visit_time || null,
          property_category: lead.property_category || null,
          possession_from: lead.possession_from || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead status updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
