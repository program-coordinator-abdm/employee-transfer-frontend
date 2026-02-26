import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, UserPlus, FileDown, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNewEmployees, type NewEmployee } from "@/lib/api";
import { exportEmployeesToPDF, exportEmployeesToExcel } from "@/lib/employeeExport";

const PAGE_SIZE = 20;

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getNewEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.trim().toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.kgid.toLowerCase().includes(q) ||
        emp.currentPostHeld.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const paginatedEmployees = filteredEmployees.slice(startIdx, startIdx + PAGE_SIZE);

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

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
              <p className="text-sm text-muted-foreground">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}{searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : " registered"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {employees.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => exportEmployeesToPDF(filteredEmployees, "Employee_List")} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <FileDown className="w-4 h-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportEmployeesToExcel(filteredEmployees, "Employee_List")} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </Button>
              </>
            )}
            <Button onClick={() => navigate("/employee/new")} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add Employee
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {!loading && employees.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, KGID, or designation..."
              className="input-field w-full pl-12 pr-10"
              aria-label="Search employees"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{searchQuery.trim() ? "No matching employees" : "No employees yet"}</h3>
              <p className="text-muted-foreground text-sm max-w-md">{searchQuery.trim() ? `No employees found matching "${searchQuery.trim()}". Try a different search.` : "Start by adding a new employee to the system."}</p>
              {!searchQuery.trim() && (
                <Button onClick={() => navigate("/employee/new")} className="btn-primary mt-2">
                  <UserPlus className="w-4 h-4 mr-2" /> Add New Employee
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
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
                    {paginatedEmployees.map((emp, idx) => (
                      <tr key={emp.id} className="table-row">
                        <td className="table-cell font-medium">{startIdx + idx + 1}</td>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 bg-surface rounded-xl p-4 shadow-elegant border border-border/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{startIdx + 1}</span> to{" "}
                    <span className="font-medium text-foreground">{Math.min(startIdx + PAGE_SIZE, filteredEmployees.length)}</span> of{" "}
                    <span className="font-medium text-foreground">{filteredEmployees.length}</span> employees
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === "..." ? (
                            <span className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                                currentPage === page
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeList;
