// Employee Transfer Management System - Main App
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
import Reports from "./pages/Reports";
import Promotions from "./pages/Promotions";
import DataOfficerDashboard from "./pages/DataOfficerDashboard";
import EmployeeCreate from "./pages/EmployeeCreate";
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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Admin routes */}
              <Route path="/categories" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Categories /></ProtectedRoute>} />
              <Route path="/staff" element={<Navigate to="/categories" replace />} />
              <Route path="/employees" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Employees /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute allowedRoles={["ADMIN"]}><EmployeeDetail /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Reports /></ProtectedRoute>} />
              <Route path="/promotions" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Promotions /></ProtectedRoute>} />

              {/* Data Officer routes */}
              <Route path="/data-officer" element={<ProtectedRoute allowedRoles={["DATA_OFFICER"]}><DataOfficerDashboard /></ProtectedRoute>} />
              <Route path="/employee/new" element={<ProtectedRoute allowedRoles={["DATA_OFFICER"]}><EmployeeCreate /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
