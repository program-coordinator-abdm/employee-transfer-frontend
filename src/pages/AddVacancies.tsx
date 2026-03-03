import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { KARNATAKA_DISTRICTS, ALL_POSITIONS } from "@/lib/positions";
import { getTaluks, getCities } from "@/lib/karnatakaGeo";
import { submitVacancies } from "@/lib/api";
import Toast, { useToastState } from "@/components/Toast";

const INSTITUTION_TYPES = [
  "SC", "PHC/UPHC", "CHC", "Taluk General Hospital", "Sub Division Hospital",
  "District Hospital", "District Level Hospitals", "MCH/W&C", "Prisons Hospitals", "AD Office",
  "Taluk Health Office", "DHO Office",
  "PO Office", "DJD", "Directorate", "Commissionerate",
  "Others",
];

interface VacancyRowLocal {
  designation: string;
  customDesignation: string;
  sanctioned: string;
  working: string;
}

const emptyRow = (): VacancyRowLocal => ({ designation: "", customDesignation: "", sanctioned: "", working: "" });

const calcVacant = (sanctioned: string, working: string): number => {
  const s = parseInt(sanctioned) || 0;
  const w = parseInt(working) || 0;
  return Math.max(0, s - w);
};

const AddVacancies: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToastState();

  const [institutionType, setInstitutionType] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [cityTownVillage, setCityTownVillage] = useState("");
  const [villageOtherMode, setVillageOtherMode] = useState(false);
  const [villageOtherText, setVillageOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [rows, setRows] = useState<VacancyRowLocal[]>([emptyRow()]);

  const taluks = district ? getTaluks(district) : [];
  const cities = taluk ? getCities(district, taluk) : [];

  const resolvedCity = villageOtherMode ? villageOtherText.trim() : cityTownVillage;

  const isFormComplete =
    institutionType &&
    institutionName.trim() &&
    district &&
    taluk &&
    resolvedCity;

  const updateRow = (idx: number, field: keyof VacancyRowLocal, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) => {
    if (rows.length > 1) setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const designationNames = ALL_POSITIONS.map((p) => p.name);

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => {
      const desig = r.designation === "__other__" ? r.customDesignation.trim() : r.designation;
      return desig && r.sanctioned;
    });

    if (validRows.length === 0) {
      showToast("Please add at least one vacancy row with designation and sanctioned positions.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await submitVacancies({
        institutionTypeName: institutionType.trim(),
        institutionName: institutionName.trim(),
        district: district.trim(),
        taluk: taluk.trim(),
        cityOrTownOrVillage: resolvedCity.trim(),
        lines: validRows.map((r) => ({
          designationName: (r.designation === "__other__" ? r.customDesignation.trim() : r.designation).trim(),
          sanctionedPositions: parseInt(r.sanctioned) || 0,
          filled: parseInt(r.working) || 0,
          vacant: calcVacant(r.sanctioned, r.working),
        })),
      });
      showToast("Vacancies submitted successfully!", "success");
      // Reset form
      setRows([emptyRow()]);
    } catch (err: any) {
      showToast(err?.message || "Failed to submit vacancies", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/categories")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Add Vacancies</h1>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type of Institution <span className="text-destructive">*</span></label>
              <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} className="input-field w-full">
                <option value="">Select Type of Institution</option>
                {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Institution Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name of Institution <span className="text-destructive">*</span></label>
              <Input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="Enter institution name" />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">District <span className="text-destructive">*</span></label>
              <select value={district} onChange={(e) => { setDistrict(e.target.value); setTaluk(""); setCityTownVillage(""); setVillageOtherMode(false); setVillageOtherText(""); }} className="input-field w-full">
                <option value="">Select District</option>
                {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Taluk */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Taluk <span className="text-destructive">*</span></label>
              <select value={taluk} onChange={(e) => { setTaluk(e.target.value); setCityTownVillage(""); setVillageOtherMode(false); setVillageOtherText(""); }} className="input-field w-full" disabled={!district}>
                <option value="">Select Taluk</option>
                {taluks.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* City/Town/Village */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">City / Town / Village <span className="text-destructive">*</span></label>
              {villageOtherMode ? (
                <div className="flex gap-2">
                  <Input value={villageOtherText} onChange={(e) => setVillageOtherText(e.target.value)} placeholder="Enter city/town/village name" className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => { setVillageOtherMode(false); setVillageOtherText(""); }}>Cancel</Button>
                </div>
              ) : (
                <select value={cityTownVillage} onChange={(e) => { if (e.target.value === "__other__") { setVillageOtherMode(true); setCityTownVillage(""); } else { setCityTownVillage(e.target.value); } }} className="input-field w-full" disabled={!taluk}>
                  <option value="">Select City/Town/Village</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__other__">Others</option>
                </select>
              )}
            </div>
          </div>
        </Card>

        {/* Vacancies Table */}
        {isFormComplete ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Vacancy Details</h2>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Designation</TableHead>
                    <TableHead className="min-w-[130px]">Sanctioned Positions</TableHead>
                    <TableHead className="min-w-[100px]">Working</TableHead>
                    <TableHead className="min-w-[100px]">Vacant</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {row.designation === "__other__" ? (
                          <div className="flex gap-2">
                            <Input
                              value={row.customDesignation}
                              onChange={(e) => updateRow(idx, "customDesignation", e.target.value)}
                              placeholder="Enter designation"
                              className="flex-1 text-sm"
                            />
                            <Button variant="outline" size="sm" onClick={() => { updateRow(idx, "designation", ""); updateRow(idx, "customDesignation", ""); }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <select value={row.designation} onChange={(e) => updateRow(idx, "designation", e.target.value)} className="input-field w-full text-sm">
                            <option value="">Select Designation</option>
                            {designationNames.map((d) => <option key={d} value={d}>{d}</option>)}
                            <option value="__other__">Others</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" value={row.sanctioned} onChange={(e) => updateRow(idx, "sanctioned", e.target.value)} placeholder="0" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" value={row.working} onChange={(e) => updateRow(idx, "working", e.target.value)} placeholder="0" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center h-10 px-3 rounded-md bg-muted text-sm font-medium text-foreground">
                          {calcVacant(row.sanctioned, row.working)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rows.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeRow(idx)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button variant="outline" onClick={addRow} className="gap-2">
                <Plus className="w-4 h-4" /> Add Row
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Vacancies"}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            Please fill all fields above to add vacancy details.
          </Card>
        )}
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2026 Government of Karnataka. All rights reserved.
      </footer>

      {toast && <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />}
    </div>
  );
};

export default AddVacancies;
