import { cn } from "@/lib/utils";
import { LeadStatus } from "@/hooks/useLeads";

interface LeadBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-info/15 text-info border-info/30",
  },
  contacted: {
    label: "Contacted",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  site_visit: {
    label: "Site Visit",
    className: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  },
  negotiation: {
    label: "Negotiation",
    className: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  },
  booked: {
    label: "Booked",
    className: "bg-success/15 text-success border-success/30",
  },
  lost: {
    label: "Lost",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  followup: {
    label: "Follow-Up",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  converted: {
    label: "Converted",
    className: "bg-success/15 text-success border-success/30",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-muted",
  },
};

export function LeadBadge({ status, className }: LeadBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
