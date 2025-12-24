import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Loader2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;
type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-rose-100 text-rose-800",
};

export default function Invoices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
    tax: 0,
    discount: 0,
  });

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

  const addInvoice = useMutation({
    mutationFn: async (invoice: typeof newInvoice) => {
      const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const total = subtotal + invoice.tax - invoice.discount;
      const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("invoices").insert({
        id: invoiceId,
        user_id: user!.id,
        customer_name: invoice.customerName,
        items: invoice.items,
        subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        total,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
      setIsAddOpen(false);
      setNewInvoice({
        customerName: "",
        items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
        tax: 0,
        discount: 0,
      });
    },
    onError: () => toast.error("Failed to create invoice"),
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...newInvoice.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    setNewInvoice({ ...newInvoice, items });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      setNewInvoice({
        ...newInvoice,
        items: newInvoice.items.filter((_, i) => i !== index),
      });
    }
  };

  const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + newInvoice.tax - newInvoice.discount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Home Exotica - Invoices & Billing"
        subtitle={`${invoices.length} property invoices`}
        action={
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Create Property Invoice</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Enter client name"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Items</Label>
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {newInvoice.items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rate</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Amount</Label>
                          <Input type="number" value={item.amount} readOnly className="bg-background" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tax</Label>
                    <Input
                      type="number"
                      value={newInvoice.tax}
                      onChange={(e) => setNewInvoice({ ...newInvoice, tax: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input
                      type="number"
                      value={newInvoice.discount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{newInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>-₹{newInvoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => addInvoice.mutate(newInvoice)}
                  className="w-full"
                  disabled={addInvoice.isPending || !newInvoice.customerName}
                >
                  {addInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Invoice"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {invoices.length > 0 ? (
            invoices.map((invoice, index) => (
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(invoice.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{Number(invoice.total).toFixed(2)}</p>
                    <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[invoice.payment_status])}>
                      {invoice.payment_status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border"
            >
              No property invoices yet. Create your first invoice!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
