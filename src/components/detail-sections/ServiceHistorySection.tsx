import React, { useState } from "react";
import { History } from "lucide-react";
import { WorkHistoryEntry } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  workHistory: WorkHistoryEntry[];
}

const SERVICE_TABS = [
  { key: "current", label: "Current" },
  { key: "additional", label: "Additional" },
  { key: "past", label: "Past" },
  { key: "rural", label: "Rural" },
  { key: "contract", label: "Contract" },
  { key: "admin", label: "Admin" },
] as const;

const ServiceHistorySection: React.FC<Props> = ({ workHistory }) => {
  const [activeTab, setActiveTab] = useState<string>("current");

  // Group entries by type. If no type field, treat the latest as "current" and rest as "past"
  const groupedHistory = React.useMemo(() => {
    const hasTypes = workHistory.some(e => e.type);
    if (hasTypes) {
      const groups: Record<string, WorkHistoryEntry[]> = {};
      workHistory.forEach(e => {
        const key = e.type || "past";
        if (!groups[key]) groups[key] = [];
        groups[key].push(e);
      });
      return groups;
    }

    // Fallback: reverse so most recent is first, tag current vs past
    const sorted = [...workHistory].reverse();
    const groups: Record<string, WorkHistoryEntry[]> = { current: [], past: [] };
    sorted.forEach((entry, idx) => {
      if (idx === 0 && (entry.toDate === "Present" || !entry.toDate)) {
        groups.current.push(entry);
      } else {
        groups.past.push(entry);
      }
    });
    return groups;
  }, [workHistory]);

  const currentEntries = groupedHistory[activeTab] || [];

  // Calculate period string
  const calcPeriod = (entry: WorkHistoryEntry): string => {
    if (entry.period) return entry.period;
    if (entry.durationYears > 0) {
      const years = Math.floor(entry.durationYears);
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
    return "—";
  };

  return (
    <SectionCard title="Service History" icon={History}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted/50 rounded-xl">
        {SERVICE_TABS.map(tab => (
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

      {/* Entries */}
      {currentEntries.length === 0 ? (
        <p className="text-muted-foreground">No {activeTab} service history found</p>
      ) : (
        <div className="space-y-4">
          {currentEntries.map((entry, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FieldPair label="Designation" value={entry.position} />
                <FieldPair label="Place" value={entry.hospitalName || entry.city} />
                <FieldPair label="Period" value={calcPeriod(entry)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <FieldPair label="From Date" value={entry.fromDate} />
                <FieldPair label="To Date" value={entry.toDate || "Present"} />
                <FieldPair label="District" value={entry.district || entry.city} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default ServiceHistorySection;
