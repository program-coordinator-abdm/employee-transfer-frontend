import React from "react";
import { GraduationCap } from "lucide-react";
import { EducationEntry } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  education?: EducationEntry[];
}

const EducationSection: React.FC<Props> = ({ education }) => {
  const mbbs = education?.find(e => e.type?.toLowerCase().includes("mbbs"));
  const pg = education?.find(e => e.type?.toLowerCase().includes("post graduation") || e.type?.toLowerCase().includes("pg"));

  return (
    <SectionCard title="Education Details" icon={GraduationCap}>
      {/* MBBS Details */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-foreground mb-4">MBBS Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldPair label="Institution" value={mbbs?.institution} />
          <FieldPair label="Year" value={mbbs?.year} />
        </div>
      </div>

      {/* Post Graduation Details */}
      <div>
        <h4 className="text-base font-semibold text-foreground mb-4">Post Graduation Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldPair label="Degree" value={pg?.degree} />
          <FieldPair label="Institution" value={pg?.institution} />
          <FieldPair label="University" value={pg?.university} />
          <FieldPair label="Year" value={pg?.year} />
        </div>
        <div className="mt-4">
          <FieldPair label="Specialization" value={pg?.specialization} />
        </div>
      </div>

      {/* Other education entries */}
      {education?.filter(e => !e.type?.toLowerCase().includes("mbbs") && !e.type?.toLowerCase().includes("post graduation") && !e.type?.toLowerCase().includes("pg")).map((entry, idx) => (
        <div key={idx} className="mt-6 pt-6 border-t border-border/50">
          <h4 className="text-base font-semibold text-foreground mb-4">{entry.type}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entry.degree && <FieldPair label="Degree" value={entry.degree} />}
            {entry.institution && <FieldPair label="Institution" value={entry.institution} />}
            {entry.university && <FieldPair label="University" value={entry.university} />}
            {entry.year && <FieldPair label="Year" value={entry.year} />}
            {entry.specialization && <FieldPair label="Specialization" value={entry.specialization} />}
          </div>
        </div>
      ))}
    </SectionCard>
  );
};

export default EducationSection;
