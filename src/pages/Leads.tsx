import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { LeadBadge } from "@/components/ui/lead-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useLeads, useAddLead, useUpdateLeadStatus, Lead, LeadStatus, LeadSource, LeadPriority, LeadType, PropertyType, Purpose, Furnishing, Facing, LeadInput, TenantType, PropertyCategory } from "@/hooks/useLeads";
import {
  Plus,
  MessageCircle,
  Phone,
  Globe,
  Instagram,
  PenLine,
  Loader2,
  Facebook,
  Users,
  Building,
  Flame,
  Thermometer,
  Snowflake,
  Home,
  Globe2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { LeadsImport } from "@/components/LeadsImport";

const sourceIcons: Record<LeadSource, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  walkin: <Users className="w-4 h-4" />,
  referral: <Users className="w-4 h-4" />,
  broker: <Building className="w-4 h-4" />,
  manual: <PenLine className="w-4 h-4" />,
  magicbricks: <Home className="w-4 h-4" />,
  commonfloor: <Home className="w-4 h-4" />,
  "99acres": <Globe2 className="w-4 h-4" />,
  housing: <Home className="w-4 h-4" />,
  sulekha: <Globe2 className="w-4 h-4" />,
};

const priorityConfig: Record<LeadPriority, { icon: React.ReactNode; className: string }> = {
  hot: { icon: <Flame className="w-3 h-3" />, className: "text-red-500" },
  warm: { icon: <Thermometer className="w-3 h-3" />, className: "text-orange-500" },
  cold: { icon: <Snowflake className="w-3 h-3" />, className: "text-blue-500" },
};

const statusTabs: { status: LeadStatus | "all"; label: string }[] = [
  { status: "all", label: "All" },
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "site_visit", label: "Site Visit" },
  { status: "negotiation", label: "Negotiation" },
  { status: "booked", label: "Booked" },
  { status: "lost", label: "Lost" },
];

const initialLeadState: Omit<LeadInput, 'customer_name' | 'phone' | 'source'> & { customerName: string; phone: string; source: LeadSource } = {
  customerName: "",
  phone: "",
  source: "manual",
  notes: "",
  email: "",
  lead_priority: "warm",
  lead_type: "buyer",
  alternate_phone: "",
  address: "",
  city: "",
  occupation: "",
  company_name: "",
  property_type: undefined,
  purpose: "buy",
  budget_min: undefined,
  budget_max: undefined,
  bhk_requirement: "",
  carpet_area: "",
  furnishing: undefined,
  parking_required: false,
  floor_preference: "",
  facing: undefined,
  ready_to_move: true,
  tenant_type: undefined,
  is_vegetarian: undefined,
  has_pets: undefined,
  visit_date: undefined,
  visit_time: undefined,
  property_category: undefined,
  possession_from: "",
};

export default function Leads() {
  const { data: leads = [], isLoading } = useLeads();
  const addLead = useAddLead();
  const updateStatus = useUpdateLeadStatus();
  const [activeTab, setActiveTab] = useState<LeadStatus | "all">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState(initialLeadState);

  const filteredLeads =
    activeTab === "all" ? leads : leads.filter((l) => l.status === activeTab);

  const handleAddLead = async () => {
    if (!newLead.customerName || !newLead.phone) {
      return;
    }

    await addLead.mutateAsync({
      customer_name: newLead.customerName,
      phone: newLead.phone,
      source: newLead.source,
      notes: newLead.notes || undefined,
      email: newLead.email || undefined,
      lead_priority: newLead.lead_priority,
      lead_type: newLead.lead_type,
      alternate_phone: newLead.alternate_phone || undefined,
      address: newLead.address || undefined,
      city: newLead.city || undefined,
      occupation: newLead.occupation || undefined,
      company_name: newLead.company_name || undefined,
      property_type: newLead.property_type,
      purpose: newLead.purpose,
      budget_min: newLead.budget_min,
      budget_max: newLead.budget_max,
      bhk_requirement: newLead.bhk_requirement || undefined,
      carpet_area: newLead.carpet_area || undefined,
      furnishing: newLead.furnishing,
      parking_required: newLead.parking_required,
      floor_preference: newLead.floor_preference || undefined,
      facing: newLead.facing,
      ready_to_move: newLead.ready_to_move,
      tenant_type: newLead.tenant_type,
      is_vegetarian: newLead.is_vegetarian,
      has_pets: newLead.has_pets,
      visit_date: newLead.visit_date,
      visit_time: newLead.visit_time,
      property_category: newLead.property_category,
      possession_from: newLead.possession_from || undefined,
    });

    setNewLead(initialLeadState);
    setIsAddOpen(false);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateStatus.mutateAsync({ id: leadId, status: newStatus });
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
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
        title="Home Exotica - Property Inquiries"
        subtitle={`${leads.length} total inquiries`}
        action={
          <div className="flex gap-2">
            <LeadsImport />
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Add Property Inquiry</SheetTitle>
                </SheetHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="property">Property</TabsTrigger>
                    <TabsTrigger value="tenant">Tenant</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter customer name"
                        value={newLead.customerName}
                        onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lead Source</Label>
                      <Select
                        value={newLead.source}
                        onValueChange={(v) => setNewLead({ ...newLead, source: v as LeadSource })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="facebook">Facebook Ads</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="walkin">Walk-in</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="broker">Broker</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="magicbricks">Magic Bricks</SelectItem>
                          <SelectItem value="commonfloor">Common Floor</SelectItem>
                          <SelectItem value="99acres">99 Acres</SelectItem>
                          <SelectItem value="housing">Housing.com</SelectItem>
                          <SelectItem value="sulekha">Sulekha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={newLead.lead_priority}
                          onValueChange={(v) => setNewLead({ ...newLead, lead_priority: v as LeadPriority })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hot">🔥 Hot</SelectItem>
                            <SelectItem value="warm">🌡️ Warm</SelectItem>
                            <SelectItem value="cold">❄️ Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newLead.lead_type}
                          onValueChange={(v) => setNewLead({ ...newLead, lead_type: v as LeadType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="tenant">Tenant</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this inquiry..."
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternate_phone">Alternate Phone</Label>
                      <Input
                        id="alternate_phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={newLead.alternate_phone}
                        onChange={(e) => setNewLead({ ...newLead, alternate_phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={newLead.address}
                        onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={newLead.city}
                        onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="Enter occupation"
                        value={newLead.occupation}
                        onChange={(e) => setNewLead({ ...newLead, occupation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        placeholder="Enter company name"
                        value={newLead.company_name}
                        onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="property" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select
                          value={newLead.property_type || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, property_type: v as PropertyType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="shop">Shop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Purpose</Label>
                        <Select
                          value={newLead.purpose}
                          onValueChange={(v) => setNewLead({ ...newLead, purpose: v as Purpose })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="lease">Lease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Budget Min (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Min budget"
                          value={newLead.budget_min || ""}
                          onChange={(e) => setNewLead({ ...newLead, budget_min: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Budget Max (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Max budget"
                          value={newLead.budget_max || ""}
                          onChange={(e) => setNewLead({ ...newLead, budget_max: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>BHK Requirement</Label>
                        <Select
                          value={newLead.bhk_requirement || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, bhk_requirement: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1BHK">1 BHK</SelectItem>
                            <SelectItem value="2BHK">2 BHK</SelectItem>
                            <SelectItem value="3BHK">3 BHK</SelectItem>
                            <SelectItem value="4BHK">4 BHK</SelectItem>
                            <SelectItem value="5BHK+">5+ BHK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Carpet Area</Label>
                        <Input
                          placeholder="e.g., 1200 sqft"
                          value={newLead.carpet_area || ""}
                          onChange={(e) => setNewLead({ ...newLead, carpet_area: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Furnishing</Label>
                        <Select
                          value={newLead.furnishing || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, furnishing: v as Furnishing })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unfurnished">Unfurnished</SelectItem>
                            <SelectItem value="semi">Semi-Furnished</SelectItem>
                            <SelectItem value="fully">Fully Furnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Facing</Label>
                        <Select
                          value={newLead.facing || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, facing: v as Facing })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="east">East</SelectItem>
                            <SelectItem value="west">West</SelectItem>
                            <SelectItem value="north">North</SelectItem>
                            <SelectItem value="south">South</SelectItem>
                            <SelectItem value="any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Floor Preference</Label>
                      <Input
                        placeholder="e.g., 5th floor or higher"
                        value={newLead.floor_preference || ""}
                        onChange={(e) => setNewLead({ ...newLead, floor_preference: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Parking Required</Label>
                      <Switch
                        checked={newLead.parking_required}
                        onCheckedChange={(checked) => setNewLead({ ...newLead, parking_required: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Ready to Move</Label>
                      <Switch
                        checked={newLead.ready_to_move}
                        onCheckedChange={(checked) => setNewLead({ ...newLead, ready_to_move: checked })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="tenant" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Tenant Type</Label>
                        <Select
                          value={newLead.tenant_type || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, tenant_type: v as TenantType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="bachelors">Bachelors</SelectItem>
                            <SelectItem value="any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Property Category</Label>
                        <Select
                          value={newLead.property_category || ""}
                          onValueChange={(v) => setNewLead({ ...newLead, property_category: v as PropertyCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="own">Own Property</SelectItem>
                            <SelectItem value="other_agent">Other Agent's Property</SelectItem>
                            <SelectItem value="sandya">Sandya Property</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Possession From</Label>
                      <Input
                        placeholder="e.g., Immediate, 1 month"
                        value={newLead.possession_from || ""}
                        onChange={(e) => setNewLead({ ...newLead, possession_from: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Visit Date</Label>
                        <Input
                          type="date"
                          value={newLead.visit_date || ""}
                          onChange={(e) => setNewLead({ ...newLead, visit_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Visit Time</Label>
                        <Input
                          type="time"
                          value={newLead.visit_time || ""}
                          onChange={(e) => setNewLead({ ...newLead, visit_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Vegetarian</Label>
                      <Switch
                        checked={newLead.is_vegetarian || false}
                        onCheckedChange={(checked) => setNewLead({ ...newLead, is_vegetarian: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Has Pets</Label>
                      <Switch
                        checked={newLead.has_pets || false}
                        onCheckedChange={(checked) => setNewLead({ ...newLead, has_pets: checked })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={handleAddLead} 
                  className="w-full mt-6"
                  disabled={addLead.isPending}
                >
                  {addLead.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Lead"
                  )}
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {statusTabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => setActiveTab(tab.status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all tap-highlight-none",
              activeTab === tab.status
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground border hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, index) => (
              <motion.button
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedLead(lead)}
                className="w-full p-4 bg-card rounded-xl border shadow-soft tap-highlight-none hover:shadow-card active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {sourceIcons[lead.source]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {lead.customer_name}
                        </p>
                        <span className={cn("flex items-center", priorityConfig[lead.lead_priority]?.className)}>
                          {priorityConfig[lead.lead_priority]?.icon}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      {lead.property_type && (
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {lead.property_type} • {lead.purpose}
                          {lead.bhk_requirement && ` • ${lead.bhk_requirement}`}
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <LeadBadge status={lead.status} />
                </div>
              </motion.button>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border"
            >
              No leads found
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Lead Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {sourceIcons[selectedLead.source]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <SheetTitle>{selectedLead.customer_name}</SheetTitle>
                      <span className={cn("flex items-center", priorityConfig[selectedLead.lead_priority]?.className)}>
                        {priorityConfig[selectedLead.lead_priority]?.icon}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.phone}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <LeadBadge status={selectedLead.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium capitalize">{selectedLead.lead_type}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                    <p className="text-sm font-medium capitalize">{selectedLead.source}</p>
                  </div>
                </div>

                {selectedLead.email && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{selectedLead.email}</p>
                  </div>
                )}

                {(selectedLead.property_type || selectedLead.budget_min || selectedLead.budget_max) && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Property Requirement</p>
                    <div className="text-sm space-y-1">
                      {selectedLead.property_type && (
                        <p className="capitalize">{selectedLead.property_type} • {selectedLead.purpose}</p>
                      )}
                      {(selectedLead.budget_min || selectedLead.budget_max) && (
                        <p>Budget: ₹{selectedLead.budget_min?.toLocaleString()} - ₹{selectedLead.budget_max?.toLocaleString()}</p>
                      )}
                      {selectedLead.bhk_requirement && <p>{selectedLead.bhk_requirement}</p>}
                      {selectedLead.furnishing && <p className="capitalize">{selectedLead.furnishing} furnished</p>}
                    </div>
                  </div>
                )}

                {selectedLead.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                  <p className="text-sm">
                    Created: {format(parseISO(selectedLead.created_at), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated: {format(parseISO(selectedLead.updated_at), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Change Status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["new", "contacted", "site_visit", "negotiation", "booked", "lost"] as LeadStatus[]).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={selectedLead.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(selectedLead.id, status)}
                          disabled={updateStatus.isPending}
                          className="capitalize text-xs"
                        >
                          {status.replace("_", " ")}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
