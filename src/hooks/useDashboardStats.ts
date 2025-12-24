import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfMonth, endOfMonth } from "date-fns";

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard_stats", user?.id],
    queryFn: async () => {
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Get pending follow-ups (not completed)
      const { count: pendingFollowUps } = await supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("completed", false);

      // Get conversions this month
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { count: conversions } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "converted")
        .gte("updated_at", monthStart)
        .lte("updated_at", monthEnd);

      // Get invoices for monthly sales
      const { data: invoices } = await supabase
        .from("invoices")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      const monthlySales = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

      return {
        totalCustomers: totalCustomers || 0,
        monthlySales,
        pendingFollowUps: pendingFollowUps || 0,
        conversions: conversions || 0,
      };
    },
    enabled: !!user,
  });
}
