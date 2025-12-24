import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/bottom-nav";
import {
  LayoutDashboard,
  Users,
  Target,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/" },
  { icon: <Users className="w-5 h-5" />, label: "Customers", href: "/customers" },
  { icon: <Target className="w-5 h-5" />, label: "Leads", href: "/leads" },
  { icon: <Bell className="w-5 h-5" />, label: "Follow-ups", href: "/follow-ups" },
  { icon: <MoreHorizontal className="w-5 h-5" />, label: "More", href: "/more" },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentNavItems = navItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-40">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold gradient-hero bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Home Exotica Realtors
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Real Estate CRM Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all tap-highlight-none ${
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6 max-w-4xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={currentNavItems} onNavigate={navigate} />
    </div>
  );
}
