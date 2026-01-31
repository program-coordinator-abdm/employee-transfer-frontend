import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import EmployeeCard from "@/components/EmployeeCard";
import TransferDrawer from "@/components/TransferDrawer";
import Toast, { useToastState } from "@/components/Toast";
import { getEmployee, transferEmployee } from "@/lib/api";
import { Employee } from "@/lib/constants";
import { ArrowLeft, UserX } from "lucide-react";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast, showToast, hideToast } = useToastState();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch employee details
  const fetchEmployee = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getEmployee(id);
      setEmployee(data);
    } catch (err) {
      console.error("Failed to fetch employee:", err);
      setError("Failed to load employee details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchEmployee();
    }
  }, [isAuthenticated, id, fetchEmployee]);

  const handleTransfer = async (transfer: {
    toCity: string;
    toPosition: string;
    effectiveFrom: Date;
  }) => {
    if (!id || !employee) return;

    setIsTransferLoading(true);
    try {
      const updatedEmployee = await transferEmployee(id, {
        toCity: transfer.toCity,
        toPosition: transfer.toPosition,
        effectiveFrom: transfer.effectiveFrom.toISOString(),
      });
      
      // Update local state
      setEmployee(updatedEmployee);
      setIsTransferOpen(false);
      
      // Show success toast
      showToast(`${employee.name} has been successfully transferred to ${transfer.toCity}`, "success");
      
      // Navigate back to employee list after a short delay
      setTimeout(() => {
        navigate("/employees");
      }, 2000);
    } catch (err) {
      console.error("Transfer failed:", err);
      showToast("Failed to process transfer. Please try again.", "error");
    } finally {
      setIsTransferLoading(false);
    }
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
        {/* Back Button */}
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Employee List</span>
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-surface rounded-2xl shadow-elevated border border-border/50 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading employee details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-surface rounded-2xl shadow-elevated border border-border/50 p-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
                <UserX className="w-10 h-10 text-danger" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Employee Not Found</h2>
              <p className="text-muted-foreground max-w-md">{error}</p>
              <button
                onClick={() => navigate("/employees")}
                className="btn-primary mt-4"
              >
                Return to Employee List
              </button>
            </div>
          </div>
        )}

        {/* Employee Card */}
        {employee && !isLoading && !error && (
          <EmployeeCard employee={employee} onTransfer={() => setIsTransferOpen(true)} />
        )}
      </main>

      {/* Transfer Drawer */}
      {employee && (
        <TransferDrawer
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          employee={employee}
          onSave={handleTransfer}
          isLoading={isTransferLoading}
        />
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-surface">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeDetail;
