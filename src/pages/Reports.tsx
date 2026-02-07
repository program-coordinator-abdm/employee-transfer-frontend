import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { getEmployees } from "@/lib/api";
import { Employee, CATEGORY_ROLE_MAP } from "@/lib/constants";
import {
  extractTransfers,
  computeTransferSummary,
  TransferRecord,
} from "@/lib/analytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  ArrowRightLeft,
  FileSpreadsheet,
  FileText,
  Download,
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
  "hsl(191, 100%, 34%)",
  "hsl(174, 100%, 32%)",
  "hsl(45, 100%, 51%)",
  "hsl(354, 70%, 54%)",
  "hsl(215, 19%, 35%)",
  "hsl(142, 76%, 36%)",
  "hsl(280, 60%, 50%)",
  "hsl(30, 90%, 50%)",
];

const Reports: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch all employees across categories
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
        // Deduplicate by id
        const unique = Array.from(new Map(all.map((e) => [e.id, e])).values());
        setEmployees(unique);
      } catch (err) {
        console.error("Failed to load employees for reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated]);

  const transfers = useMemo(() => extractTransfers(employees), [employees]);
  const summary = useMemo(() => computeTransferSummary(transfers), [transfers]);

  const handleExportCSV = () => {
    setIsExporting("csv");
    try {
      const headers = ["Employee", "KGID", "From City", "To City", "From Position", "To Position", "Date", "Type"];
      const rows = transfers.map((t) => [
        t.employeeName,
        t.kgid,
        t.fromCity,
        t.toCity,
        t.fromPosition,
        t.toPosition,
        t.date,
        t.isPromotion ? "Promotion" : t.isCityTransfer ? "City Transfer" : "Lateral",
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transfer-report.csv";
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
      doc.text("Transfer & Promotion Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on ${format(new Date(), "dd MMM yyyy")}`, 14, 30);
      doc.text(`Total Transfers: ${summary.totalTransfers} | Promotions: ${summary.totalPromotions} | City Transfers: ${summary.totalCityTransfers}`, 14, 36);

      autoTable(doc, {
        startY: 44,
        head: [["Employee", "KGID", "From → To City", "From → To Position", "Date", "Type"]],
        body: transfers.slice(0, 100).map((t) => [
          t.employeeName,
          t.kgid,
          `${t.fromCity} → ${t.toCity}`,
          `${t.fromPosition} → ${t.toPosition}`,
          format(new Date(t.date), "dd MMM yyyy"),
          t.isPromotion ? "Promotion" : t.isCityTransfer ? "Transfer" : "Lateral",
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 128, 128] },
      });
      doc.save("transfer-report.pdf");
    } finally {
      setIsExporting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/categories")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Transfer and promotion insights</p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={isExporting !== null} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {isExporting === "csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting !== null} className="gap-2">
              <FileText className="w-4 h-4" />
              {isExporting === "pdf" ? "Exporting..." : "PDF"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={ArrowRightLeft} label="Total Transfers" value={summary.totalTransfers} color="text-primary" />
          <SummaryCard icon={TrendingUp} label="Promotions" value={summary.totalPromotions} color="text-success" />
          <SummaryCard icon={MapPin} label="City Transfers" value={summary.totalCityTransfers} color="text-secondary" />
          <SummaryCard icon={Users} label="Employees Analyzed" value={employees.length} color="text-accent-foreground" />
        </div>

        {/* Charts */}
        <Tabs defaultValue="yearly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="yearly">By Year</TabsTrigger>
            <TabsTrigger value="destinations">Top Destinations</TabsTrigger>
            <TabsTrigger value="sources">Top Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="yearly">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Transfers & Promotions by Year</h3>
              {summary.transfersByYear.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={summary.transfersByYear}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="year" stroke="hsl(215, 15%, 45%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 15%, 45%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="transfers" name="Transfers" fill="hsl(191, 100%, 34%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="promotions" name="Promotions" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No transfer data available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="destinations">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Transfer Destinations</h3>
              {summary.topDestinations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={summary.topDestinations.slice(0, 8)}
                        dataKey="count"
                        nameKey="city"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ city, count }) => `${city}: ${count}`}
                      >
                        {summary.topDestinations.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {summary.topDestinations.map((d, i) => (
                      <div key={d.city} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-sm text-foreground">{d.city}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">No data available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Transfer Sources</h3>
              {summary.topSources.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={summary.topSources} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis type="number" stroke="hsl(215, 15%, 45%)" fontSize={12} />
                    <YAxis dataKey="city" type="category" stroke="hsl(215, 15%, 45%)" fontSize={11} width={130} />
                    <Tooltip />
                    <Bar dataKey="count" name="Transfers Out" fill="hsl(174, 100%, 32%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No data available</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Transfers Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transfer Activity</h3>
          {summary.recentTransfers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>KGID</TableHead>
                    <TableHead>From → To City</TableHead>
                    <TableHead>Position Change</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentTransfers.map((t, i) => (
                    <TableRow key={`${t.employeeId}-${i}`} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/employees/${t.employeeId}`)}>
                      <TableCell className="font-medium">{t.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{t.kgid}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{t.fromCity}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{t.toCity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{t.fromPosition}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{t.toPosition}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(t.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {t.isPromotion ? (
                          <span className="badge-secondary">Promotion</span>
                        ) : t.isCityTransfer ? (
                          <span className="badge-primary">City Transfer</span>
                        ) : (
                          <span className="badge-accent">Lateral</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No transfer records found</p>
          )}
        </Card>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-surface">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

// Summary card sub-component
const SummaryCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

export default Reports;
