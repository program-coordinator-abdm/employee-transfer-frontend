import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import EmployeeTable from "@/components/EmployeeTable";
import Pagination from "@/components/Pagination";
import ExportButtons from "@/components/ExportButtons";
import { getEmployees } from "@/lib/api";
import { Employee, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Employees: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"name" | "kgid">("name");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEmployees({
        searchMode,
        query: searchQuery,
        page: currentPage,
        limit: pageSize,
      });
      setEmployees(response.employees);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated, fetchEmployees]);

  const handleSearch = (query: string, mode: "name" | "kgid") => {
    setSearchQuery(query);
    setSearchMode(mode);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleEmployeeSelect = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/categories")}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
              <p className="text-muted-foreground">
                {totalItems > 0 ? `${totalItems} employees found` : "Manage employee transfers"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onEmployeeSelect={handleEmployeeSelect} />

        {/* Employee Table */}
        <EmployeeTable employees={employees} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && employees.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Export Section */}
        <ExportButtons />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-surface">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Employees;
