import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { getEmployees } from "@/lib/api";
import { 
  Stethoscope, 
  Heart, 
  Pill, 
  FlaskConical, 
  MonitorSpeaker, 
  Users, 
  HelpCircle, 
  Ambulance, 
  Building2,
  LucideIcon
} from "lucide-react";

interface CategoryConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { key: "doctors", label: "Doctors", icon: Stethoscope, description: "Medical Officers & Specialists" },
  { key: "nurses", label: "Nurses", icon: Heart, description: "Staff Nurses & Nursing Supervisors" },
  { key: "pharmacists", label: "Pharmacists", icon: Pill, description: "Pharmacy Staff" },
  { key: "lab-technicians", label: "Lab Technicians", icon: FlaskConical, description: "Laboratory & Pathology Staff" },
  { key: "radiology", label: "Radiology", icon: MonitorSpeaker, description: "X-Ray & Imaging Technicians" },
  { key: "support-staff", label: "Support Staff", icon: Users, description: "Ward Boys, Cleaners & Helpers" },
  { key: "it-helpdesk", label: "IT Help Desk", icon: HelpCircle, description: "Technical Support Staff" },
  { key: "emt", label: "EMT", icon: Ambulance, description: "Emergency Medical Technicians" },
  { key: "administration", label: "Administration", icon: Building2, description: "Administrative & Clerical Staff" },
];

const Categories: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  // Fetch counts from API for each category
  useEffect(() => {
    const fetchCounts = async () => {
      if (!isAuthenticated) return;
      
      setCountsLoading(true);
      const counts: Record<string, number> = {};
      
      try {
        // Fetch counts for all categories in parallel
        const promises = CATEGORY_CONFIGS.map(async (config) => {
          try {
            const response = await getEmployees({ category: config.key, limit: 1 });
            counts[config.key] = response.total;
          } catch {
            counts[config.key] = 0;
          }
        });
        
        await Promise.all(promises);
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Failed to fetch category counts:", error);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, [isAuthenticated]);

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Staff Categories</h1>
          <p className="text-muted-foreground">Select a category to view and manage employee transfers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_CONFIGS.map((category) => {
            const Icon = category.icon;
            const count = categoryCounts[category.key] ?? 0;
            return (
              <Card
                key={category.key}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
                onClick={() => handleCategorySelect(category.key)}
              >
                <div className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-0.5">{category.label}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <p className="text-sm">
                      {countsLoading ? (
                        <span className="text-muted-foreground">Loading...</span>
                      ) : (
                        <>
                          <span className="font-semibold text-primary">{count}</span>
                          <span className="text-primary ml-1">{count === 1 ? "employee" : "employees"}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Categories;
