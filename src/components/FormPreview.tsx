import React from "react";
import { format } from "date-fns";
import { Printer, Pencil, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type PastServiceEntry, type EducationFormEntry } from "@/lib/api";

const fmt = (iso: string | Date | undefined) => {
  if (!iso) return "—";
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return format(d, "dd MMM yyyy");
  } catch {
    return String(iso);
  }
};

const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
);

interface SectionProps {
  title: string;
  number: string;
  onEdit: () => void;
  children: React.ReactNode;
}

const PreviewSection: React.FC<SectionProps> = ({ title, number, onEdit, children }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{number}</span>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5">
        <Pencil className="w-3.5 h-3.5" /> Edit
      </Button>
    </div>
    {children}
  </Card>
);

export interface FormPreviewData {
  kgid: string;
  name: string;
  designation: string;
  designationGroup: string;
  designationSubGroup: string;
  firstPostHeld: string;
  dateOfEntry?: Date;
  gender: string;
  probationaryPeriod: boolean;
  probationaryPeriodDoc: string;
  probationDeclarationDate?: Date;
  dateOfBirth?: Date;
  cltCompleted: boolean;
  cltCompletedDoc: string;
  address: string;
  pinCode: string;
  email: string;
  phoneNumber: string;
  telephoneNumber: string;
  officeAddress: string;
  officePinCode: string;
  officeEmail: string;
  officePhoneNumber: string;
  officeTelephoneNumber: string;
  currentPostHeld: string;
  currentPostGroup: string;
  currentPostSubGroup: string;
  currentFirstPostHeld: string;
  currentInstitution: string;
  currentDistrict: string;
  currentTaluk: string;
  currentCityTownVillage: string;
  currentWorkingSince?: Date;
  currentAreaType: string;
  pastServices: PastServiceEntry[];
  educationDetails: EducationFormEntry[];
  terminallyIll: boolean;
  terminallyIllDoc: string;
  pregnantOrChildUnderOne: boolean;
  pregnantOrChildUnderOneDoc: string;
  retiringWithinTwoYears: boolean;
  retiringWithinTwoYearsDoc: string;
  childSpouseDisability: boolean;
  childSpouseDisabilityDoc: string;
  divorceeWidowWithChild: boolean;
  divorceeWidowWithChildDoc: string;
  spouseGovtServant: boolean;
  spouseGovtServantDoc: string;
  spouseDesignation: string;
  spouseDistrict: string;
  spouseTaluk: string;
  spouseCityTownVillage: string;
  ngoBenefits: boolean;
  ngoBenefitsDoc: string;
}

interface FormPreviewProps {
  data: FormPreviewData;
  onEdit: (section: number) => void;
  onProceed: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ data, onEdit, onProceed }) => {

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    let y = 15;
    const lm = 14;

    doc.setFontSize(16);
    doc.text("Employee Details — Preview", lm, y);
    y += 8;
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, lm, y);
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
      ["KGID", data.kgid],
      ["Name", data.name],
    ]);

    addSection("2. Designation", [
      ["Designation", data.designation],
      ["Group", `${data.designationGroup} — ${data.designationSubGroup}`],
    ]);

    addSection("3. Service & Personal Details", [
      ["Date of Entry", fmt(data.dateOfEntry)],
      ["Date of Birth", fmt(data.dateOfBirth)],
      ["Gender", data.gender],
      ["Probationary Period Completion document", data.probationaryPeriod ? `Yes — ${data.probationaryPeriodDoc}` : "No"],
      ["CLT Completed", data.cltCompleted ? `Yes${data.cltCompletedDoc ? ` — ${data.cltCompletedDoc}` : ""}` : "No"],
    ]);

    addSection("4. Education Information", (() => {
      const rows: [string, string][] = [];
      data.educationDetails.filter(e => e.level).forEach((e, i) => {
        rows.push([`#${i + 1} Level`, e.level]);
        rows.push([`#${i + 1} Institution`, e.institution]);
        rows.push([`#${i + 1} Date of Passing`, e.yearOfPassing]);
        
        if (e.documentProof) rows.push([`#${i + 1} Document`, e.documentProof]);
      });
      return rows.length > 0 ? rows : [["", "No education entries"]];
    })());

    addSection("5. Communication Address", [
      ["Personal Address", data.address],
      ["Pin Code", data.pinCode],
      ["Email", data.email],
      ["Phone", data.phoneNumber],
      ["Telephone", data.telephoneNumber || "—"],
      ["Office Address", data.officeAddress],
      ["Office Pin Code", data.officePinCode],
      ["Office Email", data.officeEmail],
      ["Office Phone", data.officePhoneNumber],
      ["Office Telephone", data.officeTelephoneNumber || "—"],
    ]);

    addSection("6. Current Working Details", [
      ["Post Held", data.currentPostHeld],
      ["Group", `${data.currentPostGroup} — ${data.currentPostSubGroup}`],
      ["Institution", data.currentInstitution],
      ["District", data.currentDistrict],
      ["Taluk", data.currentTaluk],
      ["City/Town/Village", data.currentCityTownVillage],
      ...(data.currentAreaType ? [["Area Type", data.currentAreaType] as [string, string]] : []),
      ["Working Since", fmt(data.currentWorkingSince)],
    ]);

    if (data.pastServices.length > 0) {
      const rows: [string, string][] = [];
      data.pastServices.forEach((ps, i) => {
        rows.push([`#${i + 1} Post`, ps.postHeld]);
        rows.push([`#${i + 1} Institution`, ps.institution]);
        rows.push([`#${i + 1} District`, ps.district]);
        rows.push([`#${i + 1} From – To`, `${fmt(ps.fromDate)} — ${fmt(ps.toDate)}`]);
        rows.push([`#${i + 1} Tenure`, ps.tenure]);
      });
      addSection("7. Past Service Details", rows);
    }

    // Spouse Working Details
    const spouseRows: [string, string][] = [
      ["Spouse Govt Servant", data.spouseGovtServant ? `Yes — ${data.spouseGovtServantDoc}` : "No"],
    ];
    if (data.spouseGovtServant) {
      if (data.spouseDesignation) spouseRows.push(["Spouse Designation", data.spouseDesignation]);
      if (data.spouseDistrict) spouseRows.push(["District", data.spouseDistrict]);
      if (data.spouseTaluk) spouseRows.push(["Taluk", data.spouseTaluk]);
      if (data.spouseCityTownVillage) spouseRows.push(["City/Town/Village", data.spouseCityTownVillage]);
    }
    addSection("8. Spouse Working Details", spouseRows);

    const conditions: [string, string][] = [
      ["Terminal Illness", data.terminallyIll ? `Yes — ${data.terminallyIllDoc}` : "No"],
      ["Pregnant / Child < 1 year", data.pregnantOrChildUnderOne ? `Yes — ${data.pregnantOrChildUnderOneDoc}` : "No"],
      ["Retiring within 2 years", data.retiringWithinTwoYears ? `Yes — ${data.retiringWithinTwoYearsDoc}` : "No"],
      ["Disability 40%+", data.childSpouseDisability ? `Yes — ${data.childSpouseDisabilityDoc}` : "No"],
      ["Widow/Divorcee with child < 12", data.divorceeWidowWithChild ? `Yes — ${data.divorceeWidowWithChildDoc}` : "No"],
    ];
    addSection("9. Special Conditions", conditions);

    addSection("10. NGO Benefits for Elected Members", [
      ["NGO Benefits", data.ngoBenefits ? `Yes — ${data.ngoBenefitsDoc}` : "No"],
    ]);

    doc.save(`Employee_Preview_${data.kgid || "draft"}.pdf`);
  };

  const boolLabel = (val: boolean, doc: string) =>
    val ? <span className="text-destructive font-medium">Yes {doc && `— ${doc}`}</span> : "No";

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Preview — Verify Your Details</h2>
            <p className="text-sm text-muted-foreground">Review all sections below. Click <strong>Edit</strong> on any section to make changes. Use <strong>Print PDF</strong> for a hard copy.</p>
          </div>
          <Button type="button" variant="outline" onClick={handlePrintPDF} className="gap-2 shrink-0">
            <Printer className="w-4 h-4" /> Print PDF
          </Button>
        </div>
      </Card>

      {/* Section 1 */}
      <PreviewSection title="Basic Information" number="1" onEdit={() => onEdit(1)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="KGID" value={data.kgid} />
          <Field label="Name" value={data.name} />
        </div>
      </PreviewSection>

      {/* Section 2 */}
      <PreviewSection title="Designation" number="2" onEdit={() => onEdit(2)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Designation" value={data.designation} />
          <Field label="Group" value={`${data.designationGroup} — ${data.designationSubGroup}`} />
          {data.firstPostHeld && <Field label="First Post Held" value={data.firstPostHeld} />}
        </div>
      </PreviewSection>

      {/* Section 3 */}
      <PreviewSection title="Service & Personal Details" number="3" onEdit={() => onEdit(3)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Date of Entry" value={fmt(data.dateOfEntry)} />
          <Field label="Date of Birth" value={fmt(data.dateOfBirth)} />
          <Field label="Gender" value={data.gender} />
          <Field label="Probationary Period Completion document" value={boolLabel(data.probationaryPeriod, data.probationaryPeriodDoc)} />
          {data.probationaryPeriod && data.probationDeclarationDate && (
            <Field label="Probation Declaration Date" value={fmt(data.probationDeclarationDate)} />
          )}
          <Field label="CLT Completed" value={data.cltCompleted ? (data.cltCompletedDoc ? `Yes — ${data.cltCompletedDoc}` : "Yes") : "No"} />
        </div>
      </PreviewSection>

      {/* Section 4 - Education */}
      <PreviewSection title="Education Information" number="4" onEdit={() => onEdit(4)}>
        {data.educationDetails.length === 0 || (data.educationDetails.length === 1 && !data.educationDetails[0].level) ? (
          <p className="text-sm text-muted-foreground">No education entries.</p>
        ) : (
          <div className="space-y-4">
            {data.educationDetails.filter(e => e.level).map((e, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Entry #{idx + 1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Level" value={e.level} />
                  <Field label="Institution" value={e.institution} />
                  <Field label="Date of Passing" value={e.yearOfPassing} />
                  {e.documentProof && <Field label="Document" value={e.documentProof} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </PreviewSection>

      {/* Section 5 */}
      <PreviewSection title="Communication Address" number="5" onEdit={() => onEdit(5)}>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Personal</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Address" value={data.address} />
          <Field label="Pin Code" value={data.pinCode} />
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phoneNumber} />
          {data.telephoneNumber && <Field label="Telephone" value={data.telephoneNumber} />}
        </div>
        <Separator className="my-4" />
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Office</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address" value={data.officeAddress} />
          <Field label="Pin Code" value={data.officePinCode} />
          <Field label="Email" value={data.officeEmail} />
          <Field label="Phone" value={data.officePhoneNumber} />
          {data.officeTelephoneNumber && <Field label="Telephone" value={data.officeTelephoneNumber} />}
        </div>
      </PreviewSection>

      {/* Section 6 */}
      <PreviewSection title="Current Working Details" number="6" onEdit={() => onEdit(6)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Post Held" value={data.currentPostHeld} />
          <Field label="Group" value={`${data.currentPostGroup} — ${data.currentPostSubGroup}`} />
          {data.currentFirstPostHeld && <Field label="First Post Held" value={data.currentFirstPostHeld} />}
          <Field label="Institution" value={data.currentInstitution} />
          <Field label="District" value={data.currentDistrict} />
          <Field label="Taluk" value={data.currentTaluk} />
          <Field label="City/Town/Village" value={data.currentCityTownVillage} />
          {data.currentAreaType && <Field label="Area Type" value={data.currentAreaType} />}
          <Field label="Working Since" value={fmt(data.currentWorkingSince)} />
        </div>
      </PreviewSection>

      {/* Section 7 */}
      <PreviewSection title="Past Service Details" number="7" onEdit={() => onEdit(7)}>
        {data.pastServices.length === 0 || (data.pastServices.length === 1 && !data.pastServices[0].postHeld) ? (
          <p className="text-sm text-muted-foreground">No past service entries.</p>
        ) : (
          <div className="space-y-4">
            {data.pastServices.filter(ps => ps.postHeld).map((ps, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Entry #{idx + 1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Post Held" value={ps.postHeld} />
                  <Field label="Group" value={`${ps.postGroup} — ${ps.postSubGroup}`} />
                  {ps.firstPostHeld && <Field label="First Post Held" value={ps.firstPostHeld} />}
                  <Field label="Institution" value={ps.institution} />
                  <Field label="District" value={ps.district} />
                  {ps.taluk && <Field label="Taluk" value={ps.taluk} />}
                  {ps.cityTownVillage && <Field label="City/Town/Village" value={ps.cityTownVillage} />}
                  <Field label="From" value={fmt(ps.fromDate)} />
                  <Field label="To" value={fmt(ps.toDate)} />
                  <Field label="Tenure" value={ps.tenure} />
                </div>
              </div>
            ))}
          </div>
        )}
      </PreviewSection>

      {/* Section 8 - Spouse Working Details */}
      <PreviewSection title="Spouse Working Details" number="8" onEdit={() => onEdit(8)}>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Spouse Govt Servant" value={boolLabel(data.spouseGovtServant, data.spouseGovtServantDoc)} />
          {data.spouseGovtServant && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {data.spouseDesignation && <Field label="Spouse Designation" value={data.spouseDesignation} />}
              {data.spouseDistrict && <Field label="District" value={data.spouseDistrict} />}
              {data.spouseTaluk && <Field label="Taluk" value={data.spouseTaluk} />}
              {data.spouseCityTownVillage && <Field label="City/Town/Village" value={data.spouseCityTownVillage} />}
            </div>
          )}
        </div>
      </PreviewSection>

      {/* Section 9 */}
      <PreviewSection title="Special Conditions" number="9" onEdit={() => onEdit(9)}>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Terminal illness / Serious ailment" value={boolLabel(data.terminallyIll, data.terminallyIllDoc)} />
          <Field label="Pregnant / Child < 1 year" value={boolLabel(data.pregnantOrChildUnderOne, data.pregnantOrChildUnderOneDoc)} />
          <Field label="Retiring within 2 years" value={boolLabel(data.retiringWithinTwoYears, data.retiringWithinTwoYearsDoc)} />
          <Field label="Disability 40%+" value={boolLabel(data.childSpouseDisability, data.childSpouseDisabilityDoc)} />
          <Field label="Widow/Divorcee with child < 12" value={boolLabel(data.divorceeWidowWithChild, data.divorceeWidowWithChildDoc)} />
        </div>
      </PreviewSection>

      {/* Section 10 */}
      <PreviewSection title="NGO Benefits for Elected Members" number="10" onEdit={() => onEdit(10)}>
        <p className="text-sm text-muted-foreground mb-3">Benefits related to NGO elected membership will be added here</p>
        <Field label="NGO Benefits" value={boolLabel(data.ngoBenefits, data.ngoBenefitsDoc)} />
      </PreviewSection>

      {/* Proceed */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" onClick={onProceed} className="gap-2 px-8 py-3 text-base">
          Proceed to Declaration <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default FormPreview;
