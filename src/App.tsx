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
              {/* Maintenance mode: all routes redirect to maintenance */}
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="*" element={<Navigate to="/maintenance" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
