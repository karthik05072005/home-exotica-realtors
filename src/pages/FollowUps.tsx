import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { useFollowUps, useAddFollowUp, useToggleFollowUpComplete, FollowUp, FollowUpType, FollowUpInput } from "@/hooks/useFollowUps";
import {
  Plus,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  Phone,
  MessageCircle,
  MapPin,
  Users,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, isFuture, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type FilterTab = "today" | "upcoming" | "missed" | "completed";

const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <Clock className="w-4 h-4" /> },
  { id: "upcoming", label: "Upcoming", icon: <Calendar className="w-4 h-4" /> },
  { id: "missed", label: "Missed", icon: <AlertCircle className="w-4 h-4" /> },
  { id: "completed", label: "Done", icon: <CheckCircle2 className="w-4 h-4" /> },
];

const followUpTypeIcons: Record<FollowUpType, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  visit: <MapPin className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
};

export default function FollowUps() {
  const { data: followUps = [], isLoading } = useFollowUps();
  const addFollowUp = useAddFollowUp();
  const toggleComplete = useToggleFollowUpComplete();
  const [activeTab, setActiveTab] = useState<FilterTab>("today");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<FollowUpInput & { customerName: string }>({
    customerName: "",
    customer_name: "",
    phone: "",
    scheduled_at: "",
    notes: "",
    follow_up_type: "call",
    auto_reminder: true,
  });

  const filterFollowUps = (tab: FilterTab): FollowUp[] => {
    switch (tab) {
      case "today":
        return followUps.filter(
          (f) => !f.completed && isToday(parseISO(f.scheduled_at))
        );
      case "upcoming":
        return followUps.filter(
          (f) => !f.completed && isFuture(parseISO(f.scheduled_at)) && !isToday(parseISO(f.scheduled_at))
        );
      case "missed":
        return followUps.filter(
          (f) => !f.completed && isPast(parseISO(f.scheduled_at)) && !isToday(parseISO(f.scheduled_at))
        );
      case "completed":
        return followUps.filter((f) => f.completed);
    }
  };

  const filteredFollowUps = filterFollowUps(activeTab);

  const handleToggleComplete = async (id: string, currentCompleted: boolean) => {
    await toggleComplete.mutateAsync({ id, completed: !currentCompleted });
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.customerName || !newFollowUp.phone || !newFollowUp.scheduled_at) {
      return;
    }

    await addFollowUp.mutateAsync({
      customer_name: newFollowUp.customerName,
      phone: newFollowUp.phone,
      scheduled_at: new Date(newFollowUp.scheduled_at).toISOString(),
      notes: newFollowUp.notes || undefined,
      follow_up_type: newFollowUp.follow_up_type,
      auto_reminder: newFollowUp.auto_reminder,
    });

    setNewFollowUp({ 
      customerName: "", 
      customer_name: "",
      phone: "", 
      scheduled_at: "", 
      notes: "",
      follow_up_type: "call",
      auto_reminder: true,
    });
    setIsAddOpen(false);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
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
        title="Home Exotica - Client Follow-ups"
        subtitle="Never miss a client interaction"
        action={
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Schedule Client Follow-up</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter client name"
                    value={newFollowUp.customerName}
                    onChange={(e) =>
                      setNewFollowUp({ ...newFollowUp, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newFollowUp.phone}
                    onChange={(e) =>
                      setNewFollowUp({ ...newFollowUp, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={newFollowUp.scheduled_at}
                    onChange={(e) =>
                      setNewFollowUp({ ...newFollowUp, scheduled_at: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Type</Label>
                  <Select
                    value={newFollowUp.follow_up_type}
                    onValueChange={(v) => setNewFollowUp({ ...newFollowUp, follow_up_type: v as FollowUpType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">📞 Call</SelectItem>
                      <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                      <SelectItem value="visit">📍 Visit</SelectItem>
                      <SelectItem value="meeting">👥 Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes..."
                    value={newFollowUp.notes}
                    onChange={(e) =>
                      setNewFollowUp({ ...newFollowUp, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label>Auto Reminder</Label>
                    <p className="text-xs text-muted-foreground">Get notified before this follow-up</p>
                  </div>
                  <Switch
                    checked={newFollowUp.auto_reminder}
                    onCheckedChange={(checked) => setNewFollowUp({ ...newFollowUp, auto_reminder: checked })}
                  />
                </div>
                <Button 
                  onClick={handleAddFollowUp} 
                  className="w-full mt-4"
                  disabled={addFollowUp.isPending}
                >
                  {addFollowUp.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Schedule Client Follow-up"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all tap-highlight-none",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-card text-muted-foreground border hover:bg-muted"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredFollowUps.length > 0 ? (
            filteredFollowUps.map((followUp, index) => (
              <motion.div
                key={followUp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "flex items-center gap-3 p-4 bg-card rounded-xl border shadow-soft",
                  followUp.completed && "opacity-60",
                  !followUp.completed &&
                    isPast(parseISO(followUp.scheduled_at)) &&
                    !isToday(parseISO(followUp.scheduled_at)) &&
                    "border-destructive/50 bg-destructive/5"
                )}
              >
                <Checkbox
                  checked={followUp.completed}
                  onCheckedChange={() => handleToggleComplete(followUp.id, followUp.completed)}
                  className="shrink-0"
                  disabled={toggleComplete.isPending}
                />
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {followUpTypeIcons[followUp.follow_up_type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium text-foreground truncate",
                      followUp.completed && "line-through"
                    )}
                  >
                    {followUp.customer_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{followUp.phone}</p>
                  {followUp.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {followUp.notes}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      !followUp.completed &&
                        isPast(parseISO(followUp.scheduled_at)) &&
                        !isToday(parseISO(followUp.scheduled_at))
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {getDateLabel(followUp.scheduled_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(followUp.scheduled_at), "h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {followUp.follow_up_type}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState
              icon={<Bell className="w-8 h-8" />}
              title={
                activeTab === "completed"
                  ? "No completed follow-ups"
                  : activeTab === "missed"
                  ? "No missed follow-ups"
                  : "No follow-ups scheduled"
              }
              description={
                activeTab === "today"
                  ? "Your day is clear! Schedule follow-ups to stay on track."
                  : activeTab === "missed"
                  ? "Great job keeping up with your follow-ups!"
                  : "Add a follow-up to get started"
              }
              action={
                activeTab !== "completed" && activeTab !== "missed"
                  ? { label: "Schedule Follow-up", onClick: () => setIsAddOpen(true) }
                  : undefined
              }
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
