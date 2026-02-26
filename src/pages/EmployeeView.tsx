import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Download, Printer, Loader2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getNewEmployeeById, type NewEmployee } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const fmt = (iso: string) => {
  try { return format(new Date(iso), "dd MMM yyyy"); } catch { return iso; }
};

const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
);

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <>
    <Separator className="my-5" />
    <h3 className="text-base font-bold text-foreground mb-4">{title}</h3>
  </>
);

const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [emp, setEmp] = useState<NewEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNewEmployeeById(id)
      .then(setEmp)
      .catch(() => setError("Failed to load employee data"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Employee Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "The requested employee record does not exist."}</p>
            <button onClick={() => navigate("/employee-list")} className="btn-primary">Go to Employee List</button>
          </Card>
        </main>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 15;
    const lm = 14;
    const fmtPdf = (d?: string) => d ? fmt(d) : "—";

    doc.setFontSize(16);
    doc.text("Employee Service Record", lm, y);
    y += 8;
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, lm, y);
    y += 10;

    const addSection = (title: string, rows: [string, string][]) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, lm, y);
      y += 2;
      autoTable(doc, {
        startY: y,
        body: rows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
        didDrawPage: (d) => { y = d.cursor?.y || y; },
      });
      y += 6;
    };

    addSection("1. Basic Information", [
      ["KGID", emp.kgid], ["Name", emp.name],
      ["Designation", emp.designation],
      ["Group", `${emp.designationGroup} — ${emp.designationSubGroup}`],
      ["Date of Entry", fmtPdf(emp.dateOfEntry)],
      ["Date of Birth", fmtPdf(emp.dateOfBirth)],
      ["Gender", emp.gender],
      ["Probationary Period Completion document", emp.probationaryPeriod ? `Yes — ${emp.probationaryPeriodDoc}` : "No"],
    ]);
    addSection("2. Personal Address", [
      ["Address", emp.address], ["Pin Code", emp.pinCode],
      ["Email", emp.email], ["Phone", emp.phoneNumber],
      ["Telephone", emp.telephoneNumber || "—"],
    ]);
    addSection("3. Office Address", [
      ["Address", emp.officeAddress], ["Pin Code", emp.officePinCode],
      ["Email", emp.officeEmail], ["Phone", emp.officePhoneNumber],
      ["Telephone", emp.officeTelephoneNumber || "—"],
    ]);
    addSection("4. Current Working Details", [
      ["Designation", emp.currentPostHeld],
      ["Group", `${emp.currentPostGroup} — ${emp.currentPostSubGroup}`],
      ["Institution", emp.currentInstitution],
      ["District", emp.currentDistrict],
      ["Taluk", emp.currentTaluk],
      ["City/Town/Village", emp.currentCityTownVillage],
      ["Working Since", fmtPdf(emp.currentWorkingSince)],
    ]);
    if (emp.pastServices.length > 0) {
      const rows: [string, string][] = [];
      emp.pastServices.forEach((ps, i) => {
        rows.push([`#${i + 1} Post`, ps.postHeld]);
        rows.push([`#${i + 1} Institution`, ps.institution]);
        rows.push([`#${i + 1} District`, ps.district]);
        rows.push([`#${i + 1} From – To`, `${fmtPdf(ps.fromDate)} — ${fmtPdf(ps.toDate)}`]);
        rows.push([`#${i + 1} Tenure`, ps.tenure]);
      });
      addSection("5. Past Service Details", rows);
    }
    addSection("6. Special Conditions", [
      ["Terminal Illness", emp.terminallyIll ? `Yes — ${emp.terminallyIllDoc}` : "No"],
      ["Pregnant / Child < 1 year", emp.pregnantOrChildUnderOne ? `Yes — ${emp.pregnantOrChildUnderOneDoc}` : "No"],
      ["Retiring within 2 years", emp.retiringWithinTwoYears ? `Yes — ${emp.retiringWithinTwoYearsDoc}` : "No"],
      ["Disability 40%+", emp.childSpouseDisability ? `Yes — ${emp.childSpouseDisabilityDoc}` : "No"],
      ["Widow/Divorcee with child < 12", emp.divorceeWidowWithChild ? `Yes — ${emp.divorceeWidowWithChildDoc}` : "No"],
      ["Spouse Govt Servant", emp.spouseGovtServant ? `Yes — ${emp.spouseGovtServantDoc}` : "No"],
    ]);
    if (emp.empDeclAgreed || emp.officerDeclAgreed) {
      const declRows: [string, string][] = [];
      if (emp.empDeclAgreed) {
        declRows.push(["Employee Declaration", "Agreed"]);
        declRows.push(["Signed By", emp.empDeclName]);
        declRows.push(["Date", fmtPdf(emp.empDeclDate)]);
      }
      if (emp.officerDeclAgreed) {
        declRows.push(["Officer Declaration", "Agreed"]);
        declRows.push(["Signed By", emp.officerDeclName]);
        declRows.push(["Date", fmtPdf(emp.officerDeclDate)]);
      }
      addSection("7. Declarations", declRows);
    }

    doc.save(`Employee_${emp.kgid || emp.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/employee-list")} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>

        <Card className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{emp.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">KGID: {emp.kgid}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </Button>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/employee/edit/${emp.id}`)} className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> Edit Details
                </Button>
              )}
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{emp.designationGroup}</Badge>
            </div>
          </div>

          {/* Basic Info */}
          <SectionHeading title="Basic Information" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.designation} />
            <Field label="Group" value={`${emp.designationGroup} — ${emp.designationSubGroup}`} />
            <Field label="Date of Entry into Service (Regular post only)" value={fmt(emp.dateOfEntry)} />
            <Field label="Date of Birth" value={fmt(emp.dateOfBirth)} />
            <Field label="Gender" value={emp.gender} />
            <Field label="Probationary Period Completion document" value={
              emp.probationaryPeriod ? <span className="font-medium">Yes {emp.probationaryPeriodDoc && `— ${emp.probationaryPeriodDoc}`}</span> : "No"
            } />
          </div>

          {/* Personal Address */}
          <SectionHeading title="Personal Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={emp.address} />
            <Field label="Pin Code" value={emp.pinCode} />
            <Field label="Email" value={emp.email} />
            <Field label="Phone Number" value={emp.phoneNumber} />
            {emp.telephoneNumber && <Field label="Telephone" value={emp.telephoneNumber} />}
          </div>

          {/* Office Address */}
          <SectionHeading title="Office Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={emp.officeAddress} />
            <Field label="Pin Code" value={emp.officePinCode} />
            <Field label="Email" value={emp.officeEmail} />
            <Field label="Phone Number" value={emp.officePhoneNumber} />
            {emp.officeTelephoneNumber && <Field label="Telephone" value={emp.officeTelephoneNumber} />}
          </div>

          {/* Current Working Details */}
          <SectionHeading title="Current Working Details" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.currentPostHeld} />
            <Field label="Group" value={`${emp.currentPostGroup} — ${emp.currentPostSubGroup}`} />
            <Field label="Institution" value={emp.currentInstitution} />
            <Field label="District" value={emp.currentDistrict} />
            <Field label="Taluk" value={emp.currentTaluk} />
            <Field label="City/Town/Village" value={emp.currentCityTownVillage} />
            <Field label="Working Since" value={fmt(emp.currentWorkingSince)} />
          </div>

          {/* Past Service Details */}
          <SectionHeading title="Past Service Details" />
          {emp.pastServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past service entries recorded.</p>
          ) : (
            <div className="space-y-4">
              {emp.pastServices.map((ps, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Service Entry #{idx + 1}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="Designation" value={ps.postHeld} />
                    <Field label="Group" value={`${ps.postGroup} — ${ps.postSubGroup}`} />
                    <Field label="Institution" value={ps.institution} />
                    <Field label="District" value={ps.district} />
                    {ps.taluk && <Field label="Taluk" value={ps.taluk} />}
                    {ps.cityTownVillage && <Field label="City/Town/Village" value={ps.cityTownVillage} />}
                    <Field label="From (Regular posts only)" value={fmt(ps.fromDate)} />
                    <Field label="To" value={fmt(ps.toDate)} />
                    <Field label="Tenure" value={ps.tenure} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Conditions */}
          <SectionHeading title="Special Conditions" />
          <div className="grid grid-cols-1 gap-4">
            <Field label="Terminal illness / Serious ailment requiring transfer" value={
              emp.terminallyIll ? <span className="text-destructive font-medium">Yes {emp.terminallyIllDoc && `— ${emp.terminallyIllDoc}`}</span> : "No"
            } />
            <Field label="Pregnant or female staff with child less than one year" value={
              emp.pregnantOrChildUnderOne ? <span className="text-destructive font-medium">Yes {emp.pregnantOrChildUnderOneDoc && `— ${emp.pregnantOrChildUnderOneDoc}`}</span> : "No"
            } />
            <Field label="Due to retire on superannuation within two years" value={
              emp.retiringWithinTwoYears ? <span className="text-destructive font-medium">Yes {emp.retiringWithinTwoYearsDoc && `— ${emp.retiringWithinTwoYearsDoc}`}</span> : "No"
            } />
            <Field label="Staff/Spouse/Child with 40%+ disability" value={
              emp.childSpouseDisability ? <span className="text-destructive font-medium">Yes {emp.childSpouseDisabilityDoc && `— ${emp.childSpouseDisabilityDoc}`}</span> : "No"
            } />
            <Field label="Widow/Widower/Divorcee with children less than 12 years" value={
              emp.divorceeWidowWithChild ? <span className="text-destructive font-medium">Yes {emp.divorceeWidowWithChildDoc && `— ${emp.divorceeWidowWithChildDoc}`}</span> : "No"
            } />
            <Field label="Married to Central/State Govt or Aided Institution employee" value={
              emp.spouseGovtServant ? <span className="text-destructive font-medium">Yes {emp.spouseGovtServantDoc && `— ${emp.spouseGovtServantDoc}`}</span> : "No"
            } />
          </div>

          {/* Declarations */}
          {emp.empDeclAgreed && (
            <>
              <SectionHeading title="Employee Declaration" />
              <div className="bg-muted/30 rounded-lg p-4 border border-border mb-3">
                <p className="text-sm text-foreground leading-relaxed">
                  I hereby declare that the details provided in this form are true and correct to the best of my knowledge. If false information is provided, I shall be liable for disciplinary action attracting major penalty as per the provisions of the <span className="font-semibold">Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957</span>.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Signed By" value={emp.empDeclName} />
                <Field label="Date" value={fmt(emp.empDeclDate)} />
              </div>
            </>
          )}

          {emp.officerDeclAgreed && (
            <>
              <SectionHeading title="Declaration by Reporting Officer" />
              <div className="bg-muted/30 rounded-lg p-4 border border-border mb-3">
                <p className="text-sm text-foreground leading-relaxed">
                  I have verified the details filled up by the employee with the service records available in this office and have found that the details are true and correct to the best of my knowledge and belief.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Signed By" value={emp.officerDeclName} />
                <Field label="Date" value={fmt(emp.officerDeclDate)} />
              </div>
            </>
          )}
        </Card>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeView;
