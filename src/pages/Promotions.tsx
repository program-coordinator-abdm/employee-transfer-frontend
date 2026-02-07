import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { getEmployees } from "@/lib/api";
import { Employee, CATEGORY_ROLE_MAP } from "@/lib/constants";
import { extractPromotions, PromotionRecord } from "@/lib/analytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  ArrowUpRight,
  MapPin,
  FileSpreadsheet,
  FileText,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CHART_COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(191, 100%, 34%)",
  "hsl(45, 100%, 51%)",
  "hsl(174, 100%, 32%)",
  "hsl(354, 70%, 54%)",
  "hsl(280, 60%, 50%)",
];

const Promotions: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const categories = Object.keys(CATEGORY_ROLE_MAP);
        const results = await Promise.all(
          categories.map((cat) => getEmployees({ category: cat, limit: 200 }))
        );
        const all = results.flatMap((r) => r.employees);
        const unique = Array.from(new Map(all.map((e) => [e.id, e])).values());
        setEmployees(unique);
      } catch (err) {
        console.error("Failed to load employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated]);

  const promotions = useMemo(() => extractPromotions(employees), [employees]);

  const filteredPromotions = useMemo(() => {
    if (!searchQuery) return promotions;
    const q = searchQuery.toLowerCase();
    return promotions.filter(
      (p) =>
        p.employeeName.toLowerCase().includes(q) ||
        p.kgid.toLowerCase().includes(q) ||
        p.fromPosition.toLowerCase().includes(q) ||
        p.toPosition.toLowerCase().includes(q)
    );
  }, [promotions, searchQuery]);

  // Stats
  const withCityTransfer = promotions.filter((p) => p.withCityTransfer).length;
  const withoutCityTransfer = promotions.length - withCityTransfer;

  // Promotions by year
  const promotionsByYear = useMemo(() => {
    const map: Record<string, number> = {};
    promotions.forEach((p) => {
      const y = new Date(p.date).getFullYear().toString();
      map[y] = (map[y] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }));
  }, [promotions]);

  // Position change frequency
  const positionChanges = useMemo(() => {
    const map: Record<string, number> = {};
    promotions.forEach((p) => {
      const key = `${p.fromPosition} → ${p.toPosition}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([change, count]) => ({ change, count }));
  }, [promotions]);

  const handleExportCSV = () => {
    setIsExporting("csv");
    try {
      const headers = ["Employee", "KGID", "From Position", "To Position", "City", "Hospital", "Date", "With City Transfer"];
      const rows = filteredPromotions.map((p) => [
        p.employeeName, p.kgid, p.fromPosition, p.toPosition, p.city, p.hospital, p.date, p.withCityTransfer ? "Yes" : "No",
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "promotions-report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting("pdf");
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Promotions Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on ${format(new Date(), "dd MMM yyyy")} | Total Promotions: ${promotions.length}`, 14, 30);

      autoTable(doc, {
        startY: 38,
        head: [["Employee", "KGID", "From Position", "To Position", "City", "Date"]],
        body: filteredPromotions.slice(0, 100).map((p) => [
          p.employeeName, p.kgid, p.fromPosition, p.toPosition, p.city, format(new Date(p.date), "dd MMM yyyy"),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 139, 34] },
      });
      doc.save("promotions-report.pdf");
    } finally {
      setIsExporting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading promotion data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/categories")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
              <p className="text-muted-foreground">Track position changes and career progressions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={isExporting !== null} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting !== null} className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{promotions.length}</p>
                <p className="text-sm text-muted-foreground">Total Promotions</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{withCityTransfer}</p>
                <p className="text-sm text-muted-foreground">With City Transfer</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{withoutCityTransfer}</p>
                <p className="text-sm text-muted-foreground">Same City Promotions</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{positionChanges.length}</p>
                <p className="text-sm text-muted-foreground">Unique Position Paths</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Promotions by Year</h3>
            {promotionsByYear.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={promotionsByYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="year" stroke="hsl(215, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 45%)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Promotions" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data available</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Position Changes</h3>
            {positionChanges.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={positionChanges}
                    dataKey="count"
                    nameKey="change"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ count }) => count}
                  >
                    {positionChanges.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data available</p>
            )}
          </Card>
        </div>

        {/* Search + Table */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-foreground">All Promotions</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, KGID, or position..."
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {filteredPromotions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>KGID</TableHead>
                    <TableHead>From Position</TableHead>
                    <TableHead>To Position</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>City Transfer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((p, i) => (
                    <TableRow
                      key={`${p.employeeId}-${i}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/employees/${p.employeeId}`)}
                    >
                      <TableCell className="font-medium">{p.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{p.kgid}</TableCell>
                      <TableCell className="text-muted-foreground">{p.fromPosition}</TableCell>
                      <TableCell className="font-medium text-success">{p.toPosition}</TableCell>
                      <TableCell>{p.city}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(p.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {p.withCityTransfer ? (
                          <span className="badge-primary">Yes</span>
                        ) : (
                          <span className="badge-accent">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? "No promotions match your search" : "No promotion records found"}
            </p>
          )}
        </Card>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-surface">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Promotions;
