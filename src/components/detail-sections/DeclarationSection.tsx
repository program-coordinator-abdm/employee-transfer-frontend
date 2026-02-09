import React from "react";
import { FileCheck } from "lucide-react";
import { Declaration } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  declaration?: Declaration;
}

const DeclarationSection: React.FC<Props> = ({ declaration }) => {
  return (
    <SectionCard title="Declaration" icon={FileCheck}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldPair label="Declaration Date" value={declaration?.declarationDate} />
        <FieldPair label="Declaration Place" value={declaration?.declarationPlace} />
        <FieldPair label="Agreed to Declaration" value={declaration?.agreedToDeclaration} />
        <FieldPair label="Remarks" value={declaration?.remarks} />
      </div>
    </SectionCard>
  );
};

export default DeclarationSection;
