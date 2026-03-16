import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { getToken } from "@/lib/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DistrictEntry {
  district: string;
  count: number;
  taluks?: { taluk: string; count: number }[];
}

interface TalukEntry {
  district: string;
  taluk: string;
  count: number;
}

/** Flatten nested taluks from district records */
function flattenTaluks(raw: DistrictEntry[]): TalukEntry[] | null {
  const result: TalukEntry[] = [];
  for (const r of raw) {
    if (r.taluks && r.taluks.length > 0) {
      for (const t of r.taluks) {
        result.push({
          district: r.district,
          taluk: t.taluk?.trim() || "Unknown",
          count: t.count,
        });
      }
    }
  }
  if (result.length === 0) return null;
  return result.sort((a, b) => a.district.localeCompare(b.district) || a.taluk.localeCompare(b.taluk));
}

const POLL_INTERVAL = 15000;

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
};

const DistrictEntryTracker: React.FC = () => {
  const navigate = useNavigate();
  const [entity, setEntity] = useState<"employees" | "vacancies">("employees");
  const [viewMode, setViewMode] = useState<"district" | "taluk">("district");
  const [data, setData] = useState<DistrictEntry[]>([]);
  const [talukData, setTalukData] = useState<TalukEntry[] | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("__all__");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/reports/district-entry-counts?entity=${entity}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const json = await res.json();
      // Accept { data: [...] } or plain array
      const raw: DistrictEntry[] = Array.isArray(json) ? json : json.data || [];
      console.log("[DistrictTracker] Sample record keys:", raw[0] ? Object.keys(raw[0]) : "empty");
      console.log("[DistrictTracker] Has taluk?", raw.some((r) => !!r.taluk));
      // Strip bracketed suffixes from district names
      const entries = raw.map((d) => ({ ...d, district: d.district.replace(/\s*\(.*?\)\s*$/, '') }));
      setData(entries);
      // Compute taluk grouping (null if API doesn't return taluk)
      const grouped = groupByTaluk(entries);
      setTalukData(grouped);
      setSelectedDistrict("__all__");
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/categories")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">District Entry Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Auto-refreshes every 15s
              {lastUpdated && ` · Last updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>

        {/* Entity & View Selectors */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <label className="text-sm font-semibold text-foreground">Entity:</label>
          <Select value={entity} onValueChange={(v) => setEntity(v as "employees" | "vacancies")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employees">Employees</SelectItem>
              <SelectItem value="vacancies">Vacancies</SelectItem>
            </SelectContent>
          </Select>
          <label className="text-sm font-semibold text-foreground ml-2">View:</label>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as "district" | "taluk")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="district">District-wise</SelectItem>
              <SelectItem value="taluk">Taluk-wise</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchData(); }} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading district data...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
            <p className="text-destructive font-medium mb-2">⚠️ {error}</p>
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchData(); }}>
              Retry
            </Button>
          </Card>
        )}

        {/* Data */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <Card className="px-5 py-3">
                <p className="text-xs text-muted-foreground">Total Districts</p>
                <p className="text-2xl font-bold text-foreground">{data.length}</p>
              </Card>
              <Card className="px-5 py-3">
                <p className="text-xs text-muted-foreground">Total {entity === "employees" ? "Employees" : "Vacancies"}</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </Card>
            </div>

            {/* District-wise View */}
            {viewMode === "district" && (
              <>
                {data.length > 0 ? (
                  <Card className="p-4">
                    <h3 className="text-base font-semibold text-foreground mb-4">District-wise Distribution</h3>
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="district" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </Card>
                ) : (
                  <Card className="p-8 text-center border-dashed border-2">
                    <p className="text-muted-foreground">No data available for the selected entity.</p>
                  </Card>
                )}

                {data.length > 0 && (
                  <Card className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, idx) => (
                          <TableRow key={row.district}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{row.district}</TableCell>
                            <TableCell className="text-right font-mono">{row.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </>
            )}

            {/* Taluk-wise View */}
            {viewMode === "taluk" && (
              <>
                {talukData && talukData.length > 0 ? (
                  <>
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-foreground">Taluk-wise Distribution</h3>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Filter by district" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">All Districts</SelectItem>
                            {[...new Set(talukData.map((t) => t.district))].map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <BarChart
                          data={talukData.filter((r) => selectedDistrict === "__all__" || r.district === selectedDistrict)}
                          margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="taluk" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </Card>

                    <Card className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Taluk</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {talukData
                            .filter((r) => selectedDistrict === "__all__" || r.district === selectedDistrict)
                            .map((row, idx) => (
                              <TableRow key={`${row.district}-${row.taluk}`}>
                                <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                <TableCell className="font-medium">{row.district}</TableCell>
                                <TableCell>{row.taluk}</TableCell>
                                <TableCell className="text-right font-mono">{row.count}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </>
                ) : (
                  <Card className="p-4 border-dashed border-2">
                    <p className="text-sm text-muted-foreground text-center">
                      ℹ️ Taluk-wise distribution is not available — the API response does not include <code className="text-xs bg-muted px-1 py-0.5 rounded">taluk</code> field.
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2026 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default DistrictEntryTracker;
