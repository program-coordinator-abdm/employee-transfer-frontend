import React from "react";
import { User } from "lucide-react";
import { Employee } from "@/lib/constants";
import { formatDateDisplay } from "@/lib/dateUtils";
import SectionCard from "./SectionCard";
import FieldPair from "./FieldPair";

interface Props {
  employee: Employee;
}

const BasicInfoSection: React.FC<Props> = ({ employee }) => {
  const formattedDob = formatDateDisplay(employee.dob);

  return (
    <SectionCard title="Basic Information" icon={User}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldPair label="Name" value={employee.name} />
        <FieldPair label="KGID Number" value={employee.kgid} />
        <FieldPair label="Email" value={employee.email} />
        <FieldPair label="Mobile" value={employee.phone} />
        <FieldPair label="Date of Birth" value={formattedDob} />
        <FieldPair label="Post Applied For" value={employee.postAppliedFor} />
        <FieldPair label="Current Designation" value={employee.currentDesignation || `${employee.currentPosition} ${employee.currentCity}`} />
        <FieldPair label="Submitted On" value={employee.submittedOn} />
      </div>
    </SectionCard>
  );
};

export default BasicInfoSection;
