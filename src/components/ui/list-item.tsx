import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
  delay?: number;
}

export function ListItem({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  showArrow = true,
  className,
  delay = 0,
}: ListItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 bg-card rounded-xl border shadow-soft tap-highlight-none",
        "hover:shadow-card active:scale-[0.98] transition-all duration-200",
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      {trailing}
      {showArrow && !trailing && (
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
    </motion.button>
  );
}
