import React, { useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Employee } from "@/lib/constants";
import BasicInfoSection from "./detail-sections/BasicInfoSection";
import ObjectionsSection from "./detail-sections/ObjectionsSection";
import EducationSection from "./detail-sections/EducationSection";
import ServiceInfoSection from "./detail-sections/ServiceInfoSection";
import AppointmentSection from "./detail-sections/AppointmentSection";
import TimeboundPromotionsSection from "./detail-sections/TimeboundPromotionsSection";
import ServiceHistorySection from "./detail-sections/ServiceHistorySection";
import ServiceHistory2Section from "./detail-sections/ServiceHistory2Section";
import AchievementsSection from "./detail-sections/AchievementsSection";
import DisciplinarySection from "./detail-sections/DisciplinarySection";
import DeclarationSection from "./detail-sections/DeclarationSection";
import DocumentsSection from "./detail-sections/DocumentsSection";

interface EmployeeCardProps {
  employee: Employee;
  onTransfer: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onTransfer }) => {
  const totalYearsOfExperience = useMemo(() => {
    if (employee.totalExperienceYears != null) return employee.totalExperienceYears;
    if (employee.workHistory?.length > 0) {
      return employee.workHistory.reduce((total, entry) => total + entry.durationYears, 0);
    }
    return employee.yearsOfWork;
  }, [employee.totalExperienceYears, employee.workHistory, employee.yearsOfWork]);

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-surface rounded-2xl shadow-elevated border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {employee.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {employee.kgid}
                  </span>
                  <span className="text-sm opacity-80">
                    {totalYearsOfExperience} years experience
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onTransfer}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all duration-200 border border-white/20"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <BasicInfoSection employee={employee} />

      {/* Objections */}
      <ObjectionsSection objections={employee.objections} />

      {/* Education Details */}
      <EducationSection education={employee.education} />

      {/* Service Information */}
      <ServiceInfoSection serviceInfo={employee.serviceInformation} />

      {/* Appointment & Probation */}
      <AppointmentSection
        appointmentDetails={employee.appointmentDetails}
        probationDetails={employee.probationDetails}
      />

      {/* Timebound Promotions */}
      <TimeboundPromotionsSection promotions={employee.timeboundPromotions} />

      {/* Service History 1 */}
      {employee.workHistory && employee.workHistory.length > 0 && (
        <ServiceHistorySection workHistory={employee.workHistory} />
      )}

      {/* Service History 2 */}
      <ServiceHistory2Section
        postgraduateQualifications={employee.postgraduateQualifications}
        administrativeRoles={employee.administrativeRoles}
        additionalCharges={employee.additionalCharges}
      />

      {/* Performance and Achievements */}
      <AchievementsSection achievements={employee.achievements} />

      {/* Disciplinary Record */}
      <DisciplinarySection record={employee.disciplinaryRecord} />

      {/* Declaration */}
      <DeclarationSection declaration={employee.declaration} />

      {/* Documents */}
      <DocumentsSection documents={employee.documents} />
    </div>
  );
};

export default EmployeeCard;
