import React from "react";
import { AlertCircle } from "lucide-react";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  objections?: string;
}

const ObjectionsSection: React.FC<Props> = ({ objections }) => {
  return (
    <SectionCard title="Objections" icon={AlertCircle}>
      <FieldPair label="Details" value={objections} />
    </SectionCard>
  );
};

export default ObjectionsSection;
