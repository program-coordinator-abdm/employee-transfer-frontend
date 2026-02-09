import React from "react";
import { Award } from "lucide-react";
import { Achievement } from "@/lib/constants";
import SectionCard from "./SectionCard";

interface Props {
  achievements?: Achievement[];
}

const AchievementsSection: React.FC<Props> = ({ achievements }) => {
  const significant = achievements?.filter(a => a.type === "significant") || [];
  const special = achievements?.filter(a => a.type === "special") || [];

  return (
    <SectionCard title="Performance and Achievements" icon={Award}>
      <div className="space-y-6">
        <div>
          <h4 className="text-base font-semibold text-foreground mb-3">Significant Achievements</h4>
          {significant.length === 0 ? (
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-muted-foreground">No significant achievements recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {significant.map((a, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/30">
                  <p className="text-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-base font-semibold text-foreground mb-3">Special Achievements</h4>
          {special.length === 0 ? (
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-muted-foreground">No special achievements recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {special.map((a, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/30">
                  <p className="text-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default AchievementsSection;
