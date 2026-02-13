import React from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { EducationEntry, PostgraduateQualification } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  education?: EducationEntry[];
  postgraduateQualifications?: PostgraduateQualification[];
}

const QualificationCard: React.FC<{ entry: EducationEntry | PostgraduateQualification; index: number; label?: string }> = ({ entry, index, label }) => {
  const title = label || ('type' in entry ? (entry as EducationEntry).type : undefined) || entry.qualification || entry.degree || `Qualification ${index + 1}`;
  return (
    <div className={index > 0 ? "mt-6 pt-6 border-t border-border/50" : ""}>
      <h4 className="text-base font-semibold text-foreground mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entry.qualification && <FieldPair label="Qualification" value={entry.qualification} />}
        {entry.degree && <FieldPair label="Degree" value={entry.degree} />}
        {entry.institution && <FieldPair label="Institution" value={entry.institution} />}
        {entry.university && <FieldPair label="University" value={entry.university} />}
        {entry.year && <FieldPair label="Year" value={entry.year} />}
        {entry.specialization && <FieldPair label="Specialization" value={entry.specialization} />}
      </div>
    </div>
  );
};

const EducationSection: React.FC<Props> = ({ education, postgraduateQualifications }) => {
  const hasEducation = education && education.length > 0;
  const hasPG = postgraduateQualifications && postgraduateQualifications.length > 0;

  return (
    <>
      {/* Education Details */}
      <SectionCard title="Education Details" icon={GraduationCap}>
        {hasEducation ? (
          education.map((entry, idx) => (
            <QualificationCard key={idx} entry={entry} index={idx} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No qualifications found</p>
        )}
      </SectionCard>

      {/* Postgraduate Qualifications */}
      <SectionCard title="Postgraduate Qualifications" icon={BookOpen}>
        {hasPG ? (
          postgraduateQualifications.map((entry, idx) => (
            <QualificationCard key={idx} entry={entry} index={idx} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No qualifications found</p>
        )}
      </SectionCard>
    </>
  );
};

export default EducationSection;
