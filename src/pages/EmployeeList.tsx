import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEmployees } from "@/lib/employeeStorage";

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const employees = getEmployees();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/categories")} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employee Details</h1>
              <p className="text-sm text-muted-foreground">{employees.length} employee{employees.length !== 1 ? "s" : ""} registered</p>
            </div>
          </div>
          <Button onClick={() => navigate("/employee/new")} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Employee
          </Button>
        </div>

        {employees.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No employees yet</h3>
              <p className="text-muted-foreground text-sm max-w-md">Start by adding a new employee to the system.</p>
              <Button onClick={() => navigate("/employee/new")} className="btn-primary mt-2">
                <UserPlus className="w-4 h-4 mr-2" /> Add New Employee
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell text-left">#</th>
                    <th className="table-cell text-left">Employee Name</th>
                    <th className="table-cell text-left">KGID Number</th>
                    <th className="table-cell text-left">Current Designation</th>
                    <th className="table-cell text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={emp.id} className="table-row">
                      <td className="table-cell font-medium">{idx + 1}</td>
                      <td className="table-cell font-semibold text-foreground">{emp.name}</td>
                      <td className="table-cell font-mono text-sm">{emp.kgid}</td>
                      <td className="table-cell">
                        <span>{emp.currentPostHeld}</span>
                        <span className="block text-xs text-primary">{emp.currentPostGroup}</span>
                      </td>
                      <td className="table-cell text-center">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/employee-view/${emp.id}`)} className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10">
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeList;
