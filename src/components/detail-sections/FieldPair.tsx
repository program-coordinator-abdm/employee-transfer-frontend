import React from "react";

interface FieldPairProps {
  label: string;
  value?: string | null;
  className?: string;
}

const FieldPair: React.FC<FieldPairProps> = ({ label, value, className = "" }) => {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-primary mb-1">{label}</p>
      <p className="text-foreground font-medium">{value || "Not provided"}</p>
    </div>
  );
};

export default FieldPair;
