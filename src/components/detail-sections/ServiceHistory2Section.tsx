import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { PostgraduateQualification, AdministrativeRole, AdditionalCharge } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  postgraduateQualifications?: PostgraduateQualification[];
  administrativeRoles?: AdministrativeRole[];
  additionalCharges?: AdditionalCharge[];
}

const TABS = [
  { key: "pg", label: "Postgraduate Qualifications" },
  { key: "admin", label: "Administrative Roles" },
  { key: "charges", label: "Additional Charges" },
] as const;

const ServiceHistory2Section: React.FC<Props> = ({
  postgraduateQualifications,
  administrativeRoles,
  additionalCharges,
}) => {
  const [activeTab, setActiveTab] = useState<string>("pg");

  return (
    <SectionCard title="Service History 2" icon={BookOpen}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted/50 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "pg" && (
        <>
          {!postgraduateQualifications || postgraduateQualifications.length === 0 ? (
            <p className="text-muted-foreground">No postgraduate qualifications found</p>
          ) : (
            <div className="space-y-4">
              {postgraduateQualifications.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldPair label="Degree" value={q.degree} />
                    <FieldPair label="Institution" value={q.institution} />
                    <FieldPair label="University" value={q.university} />
                    <FieldPair label="Year" value={q.year} />
                  </div>
                  {q.specialization && (
                    <div className="mt-4">
                      <FieldPair label="Specialization" value={q.specialization} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "admin" && (
        <>
          {!administrativeRoles || administrativeRoles.length === 0 ? (
            <p className="text-muted-foreground">No administrative roles found</p>
          ) : (
            <div className="space-y-4">
              {administrativeRoles.map((r, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldPair label="Role" value={r.role} />
                    <FieldPair label="Details" value={r.details} />
                    <FieldPair label="From Date" value={r.fromDate} />
                    <FieldPair label="To Date" value={r.toDate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "charges" && (
        <>
          {!additionalCharges || additionalCharges.length === 0 ? (
            <p className="text-muted-foreground">No additional charges found</p>
          ) : (
            <div className="space-y-4">
              {additionalCharges.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldPair label="Designation" value={c.designation} />
                    <FieldPair label="Place" value={c.place} />
                    <FieldPair label="From Date" value={c.fromDate} />
                    <FieldPair label="To Date" value={c.toDate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
};

export default ServiceHistory2Section;
