import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Stethoscope, 
  Heart, 
  Pill, 
  FlaskConical, 
  Radio, 
  Users, 
  Headphones, 
  Ambulance, 
  Building2 
} from "lucide-react";

const CATEGORIES = [
  { key: "doctors", label: "Doctors", icon: Stethoscope, description: "Medical Officers & Specialists" },
  { key: "nurses", label: "Nurses", icon: Heart, description: "Nursing Staff" },
  { key: "pharmacists", label: "Pharmacists", icon: Pill, description: "Pharmacy Staff" },
  { key: "lab-technicians", label: "Lab Technicians", icon: FlaskConical, description: "Laboratory Staff" },
  { key: "radiology", label: "Radiology", icon: Radio, description: "Radiology Technicians" },
  { key: "support-staff", label: "Support Staff", icon: Users, description: "General Support" },
  { key: "it-helpdesk", label: "IT Help Desk", icon: Headphones, description: "IT Support Staff" },
  { key: "emt", label: "EMT", icon: Ambulance, description: "Emergency Medical Technicians" },
  { key: "administration", label: "Administration", icon: Building2, description: "Administrative Staff" },
];

const Categories: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCategorySelect = (categoryKey: string) => {
    navigate(`/employees?category=${categoryKey}`);
  };

  if (isLoading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Categories</h1>
          <p className="text-muted-foreground">Select a department to view employees</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.key}
                className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary group"
                onClick={() => handleCategorySelect(category.key)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-surface">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Categories;
