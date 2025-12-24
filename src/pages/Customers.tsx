import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { ListItem } from "@/components/ui/list-item";
import { EmptyState } from "@/components/ui/empty-state";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomers, useAddCustomer, useCustomerFollowUps, Customer, CustomerInput } from "@/hooks/useCustomers";
import { Plus, Search, Users, Phone, Mail, MapPin, Loader2, Building, Briefcase, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Customers() {
  const { data: customers = [], isLoading } = useCustomers();
  const addCustomer = useAddCustomer();
  const followUps = useCustomerFollowUps(showHistoryForCustomer);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistoryForCustomer, setShowHistoryForCustomer] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
    email: "",
    address: "",
    whatsapp_number: "",
    city: "",
    occupation: "",
    company_name: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      return;
    }

    await addCustomer.mutateAsync(newCustomer);

    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      whatsapp_number: "",
      city: "",
      occupation: "",
      company_name: "",
    });
    setIsAddOpen(false);
  };

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
        title="Home Exotica - Clients"
        subtitle={`${customers.length} total clients`}
        action={
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Add Client</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newCustomer.whatsapp_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="Enter occupation"
                    value={newCustomer.occupation}
                    onChange={(e) => setNewCustomer({ ...newCustomer, occupation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    placeholder="Enter company name"
                    value={newCustomer.company_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleAddCustomer} 
                  className="w-full mt-4"
                  disabled={addCustomer.isPending}
                >
                  {addCustomer.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Client"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <ListItem
                key={customer.id}
                icon={<Users className="w-5 h-5" />}
                title={customer.name}
                subtitle={`${customer.phone}${customer.city ? ` • ${customer.city}` : ""}`}
                onClick={() => setSelectedCustomer(customer)}
                delay={index * 0.03}
              />
            ))
          ) : (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No customers found"
              description={
                searchQuery
                  ? "Try a different search term"
                  : "Add your first client to get started"
              }
              action={
                !searchQuery
                  ? { label: "Add Client", onClick: () => setIsAddOpen(true) }
                  : undefined
              }
            />
          )}
        </AnimatePresence>
      </div>

      {/* Customer Detail Sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <SheetTitle>{selectedCustomer.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      Customer since {format(parseISO(selectedCustomer.created_at), "MMM yyyy")}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Phone</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
                {selectedCustomer.whatsapp_number && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">WhatsApp Number</p>
                      <p className="font-medium">{selectedCustomer.whatsapp_number}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                  </div>
                )}
                {(selectedCustomer.address || selectedCustomer.city) && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {[selectedCustomer.address, selectedCustomer.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {selectedCustomer.occupation && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Occupation</p>
                      <p className="font-medium">{selectedCustomer.occupation}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.company_name && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedCustomer.company_name}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      window.open(`tel:${selectedCustomer.phone}`, '_self');
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (selectedCustomer) {
                        setShowHistoryForCustomer(selectedCustomer.id);
                      }
                    }}
                  >
                    View History
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* History Dialog */}
      <Dialog 
        open={!!showHistoryForCustomer} 
        onOpenChange={() => setShowHistoryForCustomer(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Call & Follow-up History</DialogTitle>
          </DialogHeader>
          
          {followUps.isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : followUps.data && followUps.data.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followUps.data.map((followUp) => (
                <div key={followUp.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{followUp.follow_up_type}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(followUp.created_at), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {followUp.notes || "No notes"}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: <span className="capitalize">{followUp.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No follow-up history found
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
