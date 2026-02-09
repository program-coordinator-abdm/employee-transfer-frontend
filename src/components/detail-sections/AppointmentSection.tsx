import React from "react";
import { ClipboardList } from "lucide-react";
import { AppointmentDetails } from "@/lib/constants";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  appointmentDetails?: AppointmentDetails;
  probationDetails?: string;
}

const AppointmentSection: React.FC<Props> = ({ appointmentDetails, probationDetails }) => {
  return (
    <SectionCard title="Appointment Details" icon={ClipboardList}>
      <div className="mb-6">
        <h4 className="text-base font-semibold text-foreground mb-4">Initial Regular Appointment Details</h4>
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldPair label="Sl. No. in Order" value={appointmentDetails?.slNoInOrder} />
            <FieldPair label="Order No. & Date" value={appointmentDetails?.orderNoAndDate} />
          </div>
          <div className="mt-4">
            <FieldPair label="Date of Initial Appointment" value={appointmentDetails?.dateOfInitialAppointment} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-foreground mb-4">Probation Details</h4>
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
          <FieldPair label="Probation Declaration Details" value={probationDetails} />
        </div>
      </div>
    </SectionCard>
  );
};

export default AppointmentSection;
