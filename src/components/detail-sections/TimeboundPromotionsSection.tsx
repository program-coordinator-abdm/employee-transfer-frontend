import React from "react";
import { TrendingUp } from "lucide-react";
import { TimeboundPromotion } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  promotions?: TimeboundPromotion[];
}

const TimeboundPromotionsSection: React.FC<Props> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) {
    return (
      <SectionCard title="Timebound Promotions" icon={TrendingUp}>
        <p className="text-muted-foreground">No timebound promotions recorded</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Timebound Promotions" icon={TrendingUp}>
      <div className="space-y-4">
        {promotions.map((promo, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <h4 className="text-base font-semibold text-foreground mb-4">{promo.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldPair label="Status" value={promo.status} />
              <FieldPair label="Order" value={promo.order} />
            </div>
            {promo.date && (
              <div className="mt-4">
                <FieldPair label="Date" value={promo.date} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default TimeboundPromotionsSection;
