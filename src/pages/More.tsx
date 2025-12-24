import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { ListItem } from "@/components/ui/list-item";
import {
  FileText,
  CreditCard,
  FolderOpen,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const menuSections = [
  {
    title: "Business",
    items: [
      {
        icon: <FileText className="w-5 h-5" />,
        title: "Invoices & Billing",
        subtitle: "Create invoices and receipts",
        href: "/invoices",
      },
      {
        icon: <CreditCard className="w-5 h-5" />,
        title: "Payments",
        subtitle: "Track payment status",
        href: "/payments",
      },
      {
        icon: <FolderOpen className="w-5 h-5" />,
        title: "Documents",
        subtitle: "Store files and notes",
        href: "/documents",
      },
    ],
  },
  

];

export default function More() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Home Exotica - More" subtitle="Real Estate Management Tools" />

      {menuSections.map((section, sectionIndex) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <ListItem
                key={item.href}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onClick={() => navigate(item.href)}
                delay={sectionIndex * 0.1 + itemIndex * 0.05}
              />
            ))}
          </div>
        </motion.section>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground pt-4"
      >
        Home Exotica Realtors v1.0.0
      </motion.p>
    </div>
  );
}
