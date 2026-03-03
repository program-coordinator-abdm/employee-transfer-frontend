import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Building2, MapPin, Loader2 } from "lucide-react";
import { fetchVacancyInstitutions, fetchVacanciesByInstitution, type VacancyInstitution, type VacancySubmission } from "@/lib/api";

const ViewVacancies: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<VacancyInstitution[]>([]);
  const [loadingInst, setLoadingInst] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");
  const [submissions, setSubmissions] = useState<VacancySubmission[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

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
    setSubmissions([]);
    try {
      const data = await fetchVacanciesByInstitution(selectedKey);
      setSubmissions(data);
    } catch {
      setError("Failed to load vacancy data.");
    } finally {
      setLoadingData(false);
    }
  };

  const selectedInst = institutions.find((i) => i.institutionKey === selectedKey);

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

        {/* Institution selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Select Institution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={selectedKey} onValueChange={setSelectedKey} disabled={loadingInst}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingInst ? "Loading institutions..." : "Choose an institution"} />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.institutionKey} value={inst.institutionKey}>
                        {inst.institutionName} – {inst.taluk} – {inst.district}
                        {inst.institutionTypeName ? ` (${inst.institutionTypeName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleView} disabled={!selectedKey || loadingData} className="btn-primary">
                {loadingData ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Institution summary */}
        {selectedInst && submissions.length > 0 && (
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedInst.institutionTypeName || "—"}</span></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedInst.institutionName}</span></div>
                <div><span className="text-muted-foreground">District:</span> <span className="font-medium">{selectedInst.district}</span></div>
                <div><span className="text-muted-foreground">Taluk:</span> <span className="font-medium">{selectedInst.taluk}</span></div>
                <div><span className="text-muted-foreground">City/Town:</span> <span className="font-medium">{selectedInst.cityOrTownOrVillage || "—"}</span></div>
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

        {!loadingData && selectedKey && submissions.length === 0 && !error && (
          <Card className="p-8 text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No vacancy data found for this institution.
          </Card>
        )}

        {!loadingData && submissions.length === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Submitted on {new Date(submissions[0].createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderTable(submissions[0].lines)}</CardContent>
          </Card>
        )}

        {!loadingData && submissions.length > 1 && (
          <Accordion type="multiple" defaultValue={[submissions[0].id || "0"]} className="space-y-3">
            {submissions.map((sub, idx) => (
              <AccordionItem key={sub.id || idx} value={sub.id || String(idx)} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="text-sm font-medium">
                    Submitted on {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {renderTable(sub.lines)}
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
