import React from "react";
import { Shield } from "lucide-react";
import { ServiceInformation } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  serviceInfo?: ServiceInformation;
}

const ServiceInfoSection: React.FC<Props> = ({ serviceInfo }) => {
  return (
    <SectionCard title="Service Information" icon={Shield}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldPair label="Deputed by Government" value={serviceInfo?.deputedByGovernment} />
        <FieldPair label="Specialist Service" value={serviceInfo?.specialistService} />
        <FieldPair label="Training in Hospital Administration" value={serviceInfo?.trainingInHospitalAdmin} />
        <FieldPair label="Spouse in Government Service" value={serviceInfo?.spouseInGovtService} />
      </div>
      {serviceInfo?.spouseServiceDetails && (
        <div className="mt-4">
          <FieldPair label="Spouse Service Details" value={serviceInfo.spouseServiceDetails} />
        </div>
      )}
    </SectionCard>
  );
};

export default ServiceInfoSection;
