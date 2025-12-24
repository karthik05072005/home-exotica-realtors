import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Check, Clock, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  paid: {
    icon: <Check className="w-4 h-4" />,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  overdue: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
};

export default function Payments() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ payment_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Payment status updated");
    },
    onError: () => toast.error("Failed to update payment status"),
  });

  const filteredInvoices = filter === "all" 
    ? invoices 
    : invoices.filter(inv => inv.payment_status === filter);

  const totalPending = invoices
    .filter((inv) => inv.payment_status === "pending")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const totalReceived = invoices
    .filter((inv) => inv.payment_status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Home Exotica - Property Payments" subtitle="Track property payment status" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 rounded-xl border border-emerald-200"
        >
          <p className="text-xs text-emerald-600 font-medium">Received</p>
          <p className="text-xl font-bold text-emerald-700">₹{totalReceived.toFixed(2)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-amber-50 rounded-xl border border-amber-200"
        >
          <p className="text-xs text-amber-600 font-medium">Pending</p>
          <p className="text-xl font-bold text-amber-700">₹{totalPending.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {["all", "pending", "paid", "overdue"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize",
              filter === status
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground border hover:bg-muted"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice, index) => {
              const config = statusConfig[invoice.payment_status] || statusConfig.pending;
              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 bg-card rounded-xl border shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg, config.color)}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-medium">{invoice.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(invoice.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{Number(invoice.total).toFixed(2)}</p>
                      {invoice.payment_status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => updatePaymentStatus.mutate({ id: invoice.id, status: "paid" })}
                          disabled={updatePaymentStatus.isPending}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border"
            >
              No payments found
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
