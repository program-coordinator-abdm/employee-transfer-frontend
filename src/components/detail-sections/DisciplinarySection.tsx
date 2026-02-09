import React from "react";
import { Scale } from "lucide-react";
import { DisciplinaryRecord } from "@/lib/constants";
import SectionCard from "./SectionCard";

interface Props {
  record?: DisciplinaryRecord;
}

const DisciplinaryItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-base font-semibold text-foreground mb-2">{label}</h4>
    <div className="p-4 rounded-xl bg-muted/30">
      <p className="text-foreground">{value || "No records"}</p>
    </div>
  </div>
);

const DisciplinarySection: React.FC<Props> = ({ record }) => {
  return (
    <SectionCard title="Disciplinary Record" icon={Scale}>
      <div className="space-y-6">
        <DisciplinaryItem label="Departmental Enquiries" value={record?.departmentalEnquiries} />
        <DisciplinaryItem label="Suspension Periods" value={record?.suspensionPeriods} />
        <DisciplinaryItem label="Punishments Received" value={record?.punishmentsReceived} />
        <DisciplinaryItem label="Criminal Proceedings" value={record?.criminalProceedings} />
        <DisciplinaryItem label="Pending Legal Matters" value={record?.pendingLegalMatters} />
      </div>
    </SectionCard>
  );
};

export default DisciplinarySection;
