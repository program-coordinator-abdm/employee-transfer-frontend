import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Building2, MapPin, Loader2, ChevronsUpDown, Check, FilterX, Pencil } from "lucide-react";
import { fetchVacancyInstitutions, fetchVacanciesByInstitution, type VacancyInstitution, type VacancySubmission } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const ViewVacancies: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "DATA_OFFICER";
  const [institutions, setInstitutions] = useState<VacancyInstitution[]>([]);
  const [loadingInst, setLoadingInst] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [institution, setInstitution] = useState<VacancyInstitution | null>(null);
  const [submissions, setSubmissions] = useState<VacancySubmission[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  // Filter state
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterTaluk, setFilterTaluk] = useState("");

  // Derive unique districts from fetched institutions
  const districts = useMemo(() => {
    const set = new Set(institutions.map((i) => i.district).filter(Boolean));
    return Array.from(set).sort();
  }, [institutions]);

  // Derive taluks based on selected district
  const taluks = useMemo(() => {
    if (!filterDistrict) return [];
    const set = new Set(
      institutions.filter((i) => i.district === filterDistrict).map((i) => i.taluk).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [institutions, filterDistrict]);

  // Filter institutions by district, taluk, and search query
  const filteredInstitutions = useMemo(() => {
    let list = institutions;
    if (filterDistrict) list = list.filter((i) => i.district === filterDistrict);
    if (filterTaluk) list = list.filter((i) => i.taluk === filterTaluk);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((inst) =>
        `${inst.institutionName} ${inst.taluk} ${inst.district} ${inst.institutionTypeName || ""}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [institutions, filterDistrict, filterTaluk, searchQuery]);

  const selectedInst = institutions.find((i) => i.institutionKey === selectedKey);
  const hasActiveFilters = filterDistrict || filterTaluk;

  const clearFilters = () => {
    setFilterDistrict("");
    setFilterTaluk("");
    setSelectedKey("");
    setInstitution(null);
    setSubmissions([]);
  };

  useEffect(() => {
    fetchVacancyInstitutions()
      .then(setInstitutions)
      .catch(() => setError("Failed to load institutions"))
      .finally(() => setLoadingInst(false));
  }, []);

  const handleView = async () => {
    if (!selectedKey) return;
    setLoadingData(true);
    setError("");
    setInstitution(null);
    setSubmissions([]);
    try {
      const res = await fetchVacanciesByInstitution(selectedKey);
      setInstitution(res.institution || null);
      setSubmissions(Array.isArray(res.submissions) ? res.submissions : []);
    } catch {
      setError("Failed to load vacancy data.");
    } finally {
      setLoadingData(false);
    }
  };

  const sortedSubmissions = [...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderTable = (lines: VacancySubmission["lines"]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Designation</TableHead>
          <TableHead className="text-center">Sanctioned Positions</TableHead>
          <TableHead className="text-center">Working</TableHead>
          <TableHead className="text-center">Vacant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((l, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{l.designationName}</TableCell>
            <TableCell className="text-center">{l.sanctionedPositions}</TableCell>
            <TableCell className="text-center">{l.filled}</TableCell>
            <TableCell className="text-center">{l.vacant}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate("/categories")}>
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-6">View Vacancies</h1>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Filter by Location
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1 h-8">
                  <FilterX className="w-4 h-4" /> Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">District</label>
                <Select
                  value={filterDistrict}
                  onValueChange={(val) => {
                    setFilterDistrict(val);
                    setFilterTaluk("");
                    setSelectedKey("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Taluk</label>
                <Select
                  value={filterTaluk}
                  onValueChange={(val) => {
                    setFilterTaluk(val);
                    setSelectedKey("");
                  }}
                  disabled={!filterDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filterDistrict ? "All Taluks" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {taluks.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Select Facility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between font-normal text-left h-10"
                      disabled={loadingInst}
                    >
                      <span className="truncate">
                        {selectedInst
                          ? `${selectedInst.institutionName} – ${selectedInst.taluk} – ${selectedInst.district}${selectedInst.institutionTypeName ? ` (${selectedInst.institutionTypeName})` : ""}`
                          : loadingInst
                          ? "Loading institutions..."
                          : "Choose a facility"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2 border-b border-border">
                      <Input
                        placeholder="Search facility..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredInstitutions.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-3 text-center">No facilities found.</p>
                      ) : (
                        filteredInstitutions.map((inst) => (
                          <button
                            key={inst.institutionKey}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                              selectedKey === inst.institutionKey && "bg-accent"
                            )}
                            onClick={() => {
                              setSelectedKey(inst.institutionKey);
                              setPopoverOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <Check className={cn("h-4 w-4 shrink-0", selectedKey === inst.institutionKey ? "opacity-100" : "opacity-0")} />
                            <span className="truncate">
                              {inst.institutionName} – {inst.taluk} – {inst.district}
                              {inst.institutionTypeName ? ` (${inst.institutionTypeName})` : ""}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleView} disabled={!selectedKey || loadingData} className="btn-primary">
                {loadingData ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Institution summary */}
        {institution && (
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{institution.institutionTypeName || "—"}</span></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{institution.institutionName}</span></div>
                <div><span className="text-muted-foreground">District:</span> <span className="font-medium">{institution.district}</span></div>
                <div><span className="text-muted-foreground">Taluk:</span> <span className="font-medium">{institution.taluk}</span></div>
                <div><span className="text-muted-foreground">City/Town:</span> <span className="font-medium">{institution.cityOrTownOrVillage || "—"}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        {/* Results */}
        {loadingData && (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        )}

        {!loadingData && institution && sortedSubmissions.length === 0 && !error && (
          <Card className="p-8 text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No vacancy data found for this facility.
          </Card>
        )}

        {!loadingData && sortedSubmissions.length === 1 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Submitted on {new Date(sortedSubmissions[0].createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </CardTitle>
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/add-vacancies`)} className="gap-2">
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {sortedSubmissions[0].lines.length > 0 ? renderTable(sortedSubmissions[0].lines) : <p className="text-muted-foreground text-sm">No vacancy lines found.</p>}
            </CardContent>
          </Card>
        )}

        {!loadingData && sortedSubmissions.length > 1 && (
          <Accordion type="multiple" defaultValue={[sortedSubmissions[0].id || "0"]} className="space-y-3">
            {sortedSubmissions.map((sub, idx) => (
              <AccordionItem key={sub.id || idx} value={sub.id || String(idx)} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="text-sm font-medium">
                      Submitted on {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/add-vacancies`); }} className="gap-2 ml-4">
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {sub.lines.length > 0 ? renderTable(sub.lines) : <p className="text-muted-foreground text-sm">No vacancy lines found.</p>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  );
};

export default ViewVacancies;
