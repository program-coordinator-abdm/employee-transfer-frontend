import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, UserPlus, FileDown, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, Search, X, AlertCircle, Download } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchEmployeesPaginated, downloadEmployeesCSVExport, type NewEmployee } from "@/lib/api";
import { exportEmployeesToPDF, exportEmployeesToExcel } from "@/lib/employeeExport";

const PAGE_SIZE = 20;

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [csvDownloading, setCsvDownloading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Single fetch with AbortController — only depends on page + search
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const doFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchEmployeesPaginated(
          { page: currentPage, pageSize: PAGE_SIZE, search: debouncedSearch },
          controller.signal
        );
        if (!cancelled) {
          setEmployees(result.employees);
          setTotalPages(result.totalPages);
          setTotalItems(result.total);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (!cancelled) {
          console.error("[EmployeeList] Fetch failed:", err);
          setError(err.message || "Failed to load employees");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentPage, debouncedSearch]);

  const handleCSVDownload = useCallback(async () => {
    setCsvDownloading(true);
    try {
      await downloadEmployeesCSVExport();
    } catch (err) {
      console.error("CSV download failed:", err);
    } finally {
      setCsvDownloading(false);
    }
  }, []);

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

  const startIdx = (currentPage - 1) * PAGE_SIZE;

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
              <p className="text-sm text-muted-foreground">
                {totalItems} employee{totalItems !== 1 ? "s" : ""}{debouncedSearch ? ` matching "${debouncedSearch}"` : " registered"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCSVDownload}
              disabled={csvDownloading}
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Download className="w-4 h-4" /> {csvDownloading ? "Downloading..." : "Export CSV"}
            </Button>
            {employees.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => exportEmployeesToPDF(employees, "Employee_List")} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <FileDown className="w-4 h-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportEmployeesToExcel(employees, "Employee_List")} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
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
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, KGID, or designation..."
            className="input-field w-full pl-12 pr-10"
            aria-label="Search employees"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium">Failed to load employees</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p)} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : employees.length === 0 && !error ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{debouncedSearch ? "No matching employees" : "No employees yet"}</h3>
              <p className="text-muted-foreground text-sm max-w-md">{debouncedSearch ? `No employees found matching "${debouncedSearch}". Try a different search.` : "Start by adding a new employee to the system."}</p>
              {!debouncedSearch && (
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
                    {employees.map((emp, idx) => (
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
                    <span className="font-medium text-foreground">{Math.min(startIdx + PAGE_SIZE, totalItems)}</span> of{" "}
                    <span className="font-medium text-foreground">{totalItems}</span> employees
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
