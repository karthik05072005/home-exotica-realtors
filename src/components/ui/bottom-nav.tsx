import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  onNavigate: (href: string) => void;
}

export function BottomNav({ items, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, index) => (
          <motion.button
            key={item.href}
            onClick={() => onNavigate(item.href)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 tap-highlight-none transition-colors",
              item.isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="relative">
              {item.icon}
              {item.isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
