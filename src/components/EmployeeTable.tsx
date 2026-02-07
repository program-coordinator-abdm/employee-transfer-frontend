import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, MapPin, Briefcase, Calendar, Hash } from "lucide-react";
import { Employee } from "@/lib/constants";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, isLoading }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get("category");

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl shadow-elegant border border-border/50 overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-surface rounded-xl shadow-elegant border border-border/50 overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Employees Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No employees match your search criteria. Try adjusting your search terms or clearing the filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-elegant border border-border/50 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-4 text-left">Employee Name</th>
              <th className="px-6 py-4 text-left">Emp ID / KGID</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-center">Years of Work</th>
              <th className="px-6 py-4 text-left">DOB</th>
              <th className="px-6 py-4 text-left">Current City</th>
              <th className="px-6 py-4 text-left">Current Position</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="table-row">
                <td className="table-cell font-medium">{employee.name}</td>
                <td className="table-cell">
                  <span className="badge-primary">{employee.kgid}</span>
                </td>
                <td className="table-cell">{employee.role}</td>
                <td className="table-cell text-center">
                  <span className="badge-secondary">{employee.yearsOfWork} yrs</span>
                </td>
                <td className="table-cell text-muted-foreground">
                  {format(new Date(employee.dob), "dd MMM yyyy")}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {employee.currentCity}
                  </div>
                </td>
                <td className="table-cell">{employee.currentPosition}</td>
                <td className="table-cell text-center">
                  <button
                    onClick={() => navigate(`/employees/${employee.id}${categoryKey ? `?category=${categoryKey}` : ''}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {employees.map((employee) => (
          <div key={employee.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{employee.name}</h3>
                <span className="badge-primary text-xs">{employee.kgid}</span>
              </div>
              <button
                onClick={() => navigate(`/employees/${employee.id}${categoryKey ? `?category=${categoryKey}` : ''}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                {employee.role}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="w-3.5 h-3.5" />
                {employee.yearsOfWork} years
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(employee.dob), "dd MMM yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {employee.currentCity}
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Position:</span> {employee.currentPosition}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTable;
