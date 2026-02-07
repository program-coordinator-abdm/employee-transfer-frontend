import React, { useMemo } from "react";
import { MapPin, Briefcase, Calendar, Hash, Clock, ArrowRightLeft, Building2, CalendarCheck } from "lucide-react";
import { Employee } from "@/lib/constants";
import { format } from "date-fns";
import WorkHistoryTimeline from "./WorkHistoryTimeline";

interface EmployeeCardProps {
  employee: Employee;
  onTransfer: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onTransfer }) => {
  // Use totalExperienceYears from backend if available, otherwise calculate from work history
  const totalYearsOfExperience = useMemo(() => {
    if (employee.totalExperienceYears != null) {
      return employee.totalExperienceYears;
    }
    if (employee.workHistory && employee.workHistory.length > 0) {
      return employee.workHistory.reduce((total, entry) => total + entry.durationYears, 0);
    }
    return employee.yearsOfWork;
  }, [employee.totalExperienceYears, employee.workHistory, employee.yearsOfWork]);

  return (
    <div className="bg-surface rounded-2xl shadow-elevated border border-border/50 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{employee.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {employee.kgid}
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

      {/* Details */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium text-foreground">{employee.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Years of Experience</p>
                <p className="font-medium text-foreground">{totalYearsOfExperience} years</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium text-foreground">
                  {format(new Date(employee.dob), "dd MMMM yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Joining</p>
                <p className="font-medium text-foreground">
                  {employee.dateOfJoining
                    ? format(new Date(employee.dateOfJoining), "dd MMMM yyyy")
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Current Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Current Assignment
            </h3>

            <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current City</p>
                  <p className="text-xl font-semibold text-primary">{employee.currentCity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Hospital</p>
                  <p className="text-xl font-semibold text-accent-foreground">
                    {employee.currentHospitalName || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <p className="text-xl font-semibold text-secondary">{employee.currentPosition}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work History Section */}
        {employee.workHistory && employee.workHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <WorkHistoryTimeline history={employee.workHistory} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
