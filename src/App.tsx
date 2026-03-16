import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeList from "./pages/EmployeeList";
import EmployeeView from "./pages/EmployeeView";
import Reports from "./pages/Reports";
import Promotions from "./pages/Promotions";
import DataOfficerDashboard from "./pages/DataOfficerDashboard";
import EmployeeCreate from "./pages/EmployeeCreate";
import Maintenance from "./pages/Maintenance";
import AddVacancies from "./pages/AddVacancies";
import ViewVacancies from "./pages/ViewVacancies";
import DistrictEntryTracker from "./pages/DistrictEntryTracker";
import TransfersList from "./pages/TransfersList";
import TransferCreate from "./pages/TransferCreate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/maintenance" element={<Navigate to="/login" replace />} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/employee/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
              <Route path="/employee-list" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
              <Route path="/employee-view/:id" element={<ProtectedRoute><EmployeeView /></ProtectedRoute>} />
              <Route path="/employee-create" element={<ProtectedRoute><EmployeeCreate /></ProtectedRoute>} />
              <Route path="/employee-create/:id" element={<ProtectedRoute><EmployeeCreate /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
              <Route path="/data-officer-dashboard" element={<ProtectedRoute><DataOfficerDashboard /></ProtectedRoute>} />
              <Route path="/add-vacancies" element={<ProtectedRoute><AddVacancies /></ProtectedRoute>} />
              <Route path="/view-vacancies" element={<ProtectedRoute><ViewVacancies /></ProtectedRoute>} />
              <Route path="/district-entry-tracker" element={<ProtectedRoute><DistrictEntryTracker /></ProtectedRoute>} />
              <Route path="/transfers" element={<ProtectedRoute allowedRoles={["ADMIN", "TRANSFER_OPERATOR"]}><TransfersList /></ProtectedRoute>} />
              <Route path="/transfer-create" element={<ProtectedRoute allowedRoles={["ADMIN", "TRANSFER_OPERATOR"]}><TransferCreate /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
