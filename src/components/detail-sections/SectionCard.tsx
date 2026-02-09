import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children, className = "" }) => {
  return (
    <div className={`bg-surface rounded-2xl shadow-elevated border border-border/50 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default SectionCard;
