import React, { useState } from "react";
import { getDraftsForUser, deleteDraft, type EmployeeDraft } from "@/lib/draftStorage";
import { ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, UserPlus, Users, ClipboardList, Search as SearchIcon, MapPin, FileText, Trash2, Clock } from "lucide-react";
import KGIDSearch from "@/components/KGIDSearch";
import { fetchEmployeesPaginated, type NewEmployee } from "@/lib/api";

const Categories: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState<NewEmployee[]>([]);
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [drafts, setDrafts] = useState<EmployeeDraft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  // Load drafts
  React.useEffect(() => {
    if (user?.username) setDrafts(getDraftsForUser(user.username));
  }, [user?.username]);

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    if (user?.username) setDrafts(getDraftsForUser(user.username));
  };

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch employees for the "View All Employees" count
  const fetchAbortRef = React.useRef<AbortController | null>(null);

  const fetchAllEmployeesCount = React.useCallback(async () => {
    if (!isAuthenticated) return;

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setEmployeesLoading(true);
    try {
      const { employees, total } = await fetchEmployeesPaginated(
        { page: 1, pageSize: 500 },
        controller.signal
      );
      if (!controller.signal.aborted) {
        setAllEmployees(employees);
        setTotalEmployeeCount(total);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch employees count:", err);
    } finally {
      if (!controller.signal.aborted) setEmployeesLoading(false);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    fetchAllEmployeesCount();
    return () => { fetchAbortRef.current?.abort(); };
  }, [fetchAllEmployeesCount]);

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
        {/* Add Employee CTA */}
        <Card
          className="mb-8 cursor-pointer group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 hover:shadow-lg"
          onClick={() => navigate("/employee-create")}
        >
          <div className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <UserPlus className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">Add New Employee</h2>
              <p className="text-sm text-muted-foreground">Register a new employee with complete service details, designation, and working history</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button className="btn-primary px-6 py-2.5 text-base font-semibold" onClick={(e) => { e.stopPropagation(); navigate("/employee-create"); }}>
                <UserPlus className="w-5 h-5 mr-2" /> Add Employee
              </Button>
            </div>
          </div>
        </Card>

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <Card className="mb-8 border border-border">
            <div className="p-4">
              <button onClick={() => setShowDrafts(!showDrafts)} className="flex items-center gap-2 w-full text-left">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground flex-1">Saved Drafts ({drafts.length})</h3>
                <span className="text-xs text-muted-foreground">{showDrafts ? "Hide" : "Show"}</span>
              </button>
              {showDrafts && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">⚠ Drafts are stored only on this device until logout.</p>
                  {drafts.map(d => (
                    <div key={d.draftId} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{d.name || "Untitled Draft"}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {d.kgid && <span>KGID: {d.kgid}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(d.updatedAt).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button size="sm" onClick={() => navigate(`/employee-create?draftId=${d.draftId}`)}>Resume</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteDraft(d.draftId)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        <Card
          className="mb-8 cursor-pointer group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 hover:shadow-lg"
          onClick={() => navigate("/add-vacancies")}
        >
          <div className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <ClipboardList className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">Add Vacancies</h2>
              <p className="text-sm text-muted-foreground">Record sanctioned positions, filled posts, and vacancies for institutions</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button className="btn-primary px-6 py-2.5 text-base font-semibold" onClick={(e) => { e.stopPropagation(); navigate("/add-vacancies"); }}>
                <ClipboardList className="w-5 h-5 mr-2" /> Add Vacancies
              </Button>
              <Button variant="outline" className="px-5 py-2.5 text-base font-semibold border-primary/30 text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); navigate("/view-vacancies"); }}>
                <SearchIcon className="w-5 h-5 mr-2" /> View Vacancies
              </Button>
            </div>
          </div>
        </Card>

        {/* Transfers CTA - Admin & Transfer Operator */}
        {(user?.role === "ADMIN" || user?.role === "TRANSFER_OPERATOR") && (
          <Card
            className="mb-8 cursor-pointer group border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate("/transfers")}
          >
            <div className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground">Transfers</h2>
                <p className="text-sm text-muted-foreground">Create and manage employee transfer applications</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button className="btn-primary px-6 py-2.5 text-base font-semibold" onClick={(e) => { e.stopPropagation(); navigate("/transfers"); }}>
                  <ArrowRightLeft className="w-5 h-5 mr-2" /> Transfers
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* View Employees link + KGID Search */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/employee-list")} className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
            <Users className="w-4 h-4" /> View All Employees {allEmployees.length > 0 ? `(${allEmployees.length})` : ""}
          </Button>
          {allEmployees.length > 0 && (
            <div className="w-full sm:w-72">
              <KGIDSearch onSelect={(emp) => navigate(`/employee-view/${emp.id}`)} employees={allEmployees} placeholder="Quick search by KGID..." />
            </div>
          )}
        </div>

        {/* Reports & Analytics Section */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-foreground mb-1">Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm">Generate reports and track promotions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
            onClick={() => navigate("/reports")}
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">Transfer Reports</h3>
                <p className="text-sm text-muted-foreground">View transfer analytics, charts, and export downloadable reports</p>
              </div>
            </div>
          </Card>
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
            onClick={() => navigate("/promotions")}
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">Promotions</h3>
                <p className="text-sm text-muted-foreground">Track position changes, career progressions, and promotion history</p>
              </div>
            </div>
          </Card>
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
            onClick={() => navigate("/district-entry-tracker")}
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">District Entry Tracker</h3>
                <p className="text-sm text-muted-foreground">Monitor and track district-wise employee data entry progress</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Categories;
