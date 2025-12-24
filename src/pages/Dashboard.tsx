import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ListItem } from "@/components/ui/list-item";
import { LeadBadge } from "@/components/ui/lead-badge";
import {
  Users,
  IndianRupee,
  Bell,
  TrendingUp,
  Phone,
  Clock,
  Loader2,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useLeads, LeadStatus } from "@/hooks/useLeads";
import { format, isToday, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: followUps = [], isLoading: followUpsLoading } = useFollowUps();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();

  const todayFollowUps = followUps.filter(
    (f) => !f.completed && isToday(parseISO(f.scheduled_at))
  );
  const recentLeads = leads.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (statsLoading || followUpsLoading || leadsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Exotica Realtors Dashboard"
        subtitle={format(new Date(), "EEEE, MMMM d")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total Clients"
          value={stats?.totalCustomers || 0}
          icon={<Users className="w-5 h-5" />}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlySales || 0)}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats?.pendingFollowUps || 0}
          icon={<Bell className="w-5 h-5" />}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="Property Deals"
          value={stats?.conversions || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="info"
          delay={0.3}
        />
      </div>

      {/* Today's Follow-ups */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-3"
        >
          <h2 className="text-sm font-semibold text-foreground">Today's Client Follow-ups</h2>
          <button
            onClick={() => navigate("/follow-ups")}
            className="text-xs font-medium text-primary hover:underline"
          >
            View All
          </button>
        </motion.div>
        <div className="space-y-2">
          {todayFollowUps.length > 0 ? (
            todayFollowUps.map((followUp, index) => (
              <ListItem
                key={followUp.id}
                icon={<Phone className="w-5 h-5" />}
                title={followUp.customer_name}
                subtitle={followUp.notes || "No notes"}
                trailing={
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(followUp.scheduled_at), "h:mm a")}
                  </div>
                }
                onClick={() => navigate("/follow-ups")}
                delay={0.5 + index * 0.05}
              />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border"
            >
              No follow-ups scheduled for today
            </motion.p>
          )}
        </div>
      </section>

      {/* Recent Leads */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mb-3"
        >
          <h2 className="text-sm font-semibold text-foreground">Recent Property Inquiries</h2>
          <button
            onClick={() => navigate("/leads")}
            className="text-xs font-medium text-primary hover:underline"
          >
            View All
          </button>
        </motion.div>
        <div className="space-y-2">
          {recentLeads.length > 0 ? (
            recentLeads.map((lead, index) => (
              <ListItem
                key={lead.id}
                title={lead.customer_name}
                subtitle={lead.phone}
                trailing={<LeadBadge status={lead.status} />}
                onClick={() => navigate("/leads")}
                showArrow={false}
                delay={0.7 + index * 0.05}
              />
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border"
            >
              No property inquiries yet. Add your first inquiry!
            </motion.p>
          )}
        </div>
      </section>
    </div>
  );
}
