import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Download, Printer, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getNewEmployeeById, deleteEmployeeById, type NewEmployee } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fmt = (iso: string) => {
  if (!iso) return "—";
  try { return format(new Date(iso), "dd MMM yyyy"); } catch { return iso; }
};

const Field: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{typeof value === "string" ? (value || "—") : value}</p>
  </div>
);

const SectionHeading: React.FC<{ title: string; number?: number }> = ({ title, number }) => (
  <>
    <Separator className="my-5" />
    <h3 className="text-base font-bold text-foreground mb-4">
      {number ? `${number}. ` : ""}{title}
    </h3>
  </>
);

const BoolField: React.FC<{ label: string; value: boolean; doc?: string }> = ({ label, value, doc }) => (
  <Field label={label} value={
    value
      ? <span className="text-destructive font-medium">Yes{doc ? ` — ${doc}` : ""}</span>
      : "No"
  } />
);

const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [emp, setEmp] = useState<NewEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNewEmployeeById(id)
      .then(setEmp)
      .catch(() => setError("Failed to load employee data"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteEmployeeById(id);
      navigate("/employee-list");
    } catch {
      setError("Failed to delete employee");
      setDeleting(false);
    }
  };

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

  // ── PDF Generation ──
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 15;
    const lm = 14;
    const fmtPdf = (d?: string) => d ? fmt(d) : "—";
    const yn = (v: boolean, doc?: string) => v ? `Yes${doc ? ` — ${doc}` : ""}` : "No";

    doc.setFontSize(16);
    doc.text("Employee Service Record", lm, y); y += 8;
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, lm, y); y += 10;

    const addSection = (title: string, rows: [string, string][]) => {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, lm, y); y += 2;
      autoTable(doc, {
        startY: y, body: rows, theme: "plain",
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
        didDrawPage: (d) => { y = d.cursor?.y || y; },
      });
      y += 6;
    };

    // 1. Basic Information
    const basicRows: [string, string][] = [
      ["KGID", emp.kgid], ["Name", emp.name],
      ["Designation", emp.designation],
      ["Group", `${emp.designationGroup} — ${emp.designationSubGroup}`],
      ["First Post Held", emp.firstPostHeld || "—"],
      ["Date of Initial Appointment (Regular post)", fmtPdf(emp.dateOfEntry)],
      ["Date of Birth", fmtPdf(emp.dateOfBirth)],
      ["Gender", emp.gender],
      ["Recruitment Type", emp.recruitmentType || "—"],
    ];
    if (emp.recruitmentType === "Direct" && emp.directRecruitmentMode) {
      basicRows.push(["Direct Recruitment Mode", emp.directRecruitmentMode]);
    }
    if (emp.contractRegularised) {
      basicRows.push(["Contract Regularised", yn(true, emp.contractRegularisedDoc)]);
      basicRows.push(["Contract Regularised Date", fmtPdf(emp.contractRegularisedDate)]);
      basicRows.push(["Contract Joining Date", fmtPdf(emp.contractJoiningDate)]);
    }
    addSection("1. Basic Information", basicRows);

    // 2. Designation & Medical IDs
    addSection("2. Designation & Medical IDs", [
      ["Designation", emp.designation],
      ["First Post Held", emp.firstPostHeld || "—"],
      ["Doctor/Nurse/Pharmacist", yn(emp.isDoctorNursePharmacist)],
      ["HPR ID", emp.hprId || "—"],
      ["HFR ID", emp.hfrId || "—"],
    ]);

    // 3. Timebound
    const tbRows: [string, string][] = [
      ["Timebound Applicable", yn(emp.timeboundApplicable)],
    ];
    if (emp.timeboundApplicable) {
      tbRows.push(["Category", emp.timeboundCategory || "—"]);
      if (emp.timeboundCategory === "Doctors") {
        if (emp.timebound6Years) tbRows.push(["6 Years", `${yn(true, emp.timebound6YearsDoc)} — ${emp.timebound6YearsDate || "—"}`]);
        if (emp.timebound13Years) tbRows.push(["13 Years", `${yn(true, emp.timebound13YearsDoc)} — ${emp.timebound13YearsDate || "—"}`]);
        if (emp.timebound20Years) tbRows.push(["20 Years", `${yn(true, emp.timebound20YearsDoc)} — ${emp.timebound20YearsDate || "—"}`]);
      } else {
        if (emp.timebound10Years) tbRows.push(["10 Years", `${yn(true, emp.timebound10YearsDoc)} — ${emp.timebound10YearsDate || "—"}`]);
        if (emp.timebound15Years) tbRows.push(["15 Years", `${yn(true, emp.timebound15YearsDoc)} — ${emp.timebound15YearsDate || "—"}`]);
        if (emp.timebound20Years) tbRows.push(["20 Years", `${yn(true, emp.timebound20YearsDoc)} — ${emp.timebound20YearsDate || "—"}`]);
        if (emp.timebound25Years) tbRows.push(["25 Years", `${yn(true, emp.timebound25YearsDoc)} — ${emp.timebound25YearsDate || "—"}`]);
        if (emp.timebound30Years) tbRows.push(["30 Years", `${yn(true, emp.timebound30YearsDoc)} — ${emp.timebound30YearsDate || "—"}`]);
      }
    }
    tbRows.push(["Promotion Rejected", yn(emp.promotionRejected)]);
    if (emp.promotionRejected) {
      tbRows.push(["Rejected Designation", emp.promotionRejectedDesignation || "—"]);
      tbRows.push(["Rejected Date", fmtPdf(emp.promotionRejectedDate)]);
    }
    tbRows.push(["PG Bond", yn(emp.pgBond, emp.pgBondDoc)]);
    if (emp.pgBond) tbRows.push(["PG Bond Completion Date", fmtPdf(emp.pgBondCompletionDate)]);
    addSection("3. Timebound", tbRows);

    // 4. Service & Personal Details
    addSection("4. Service & Personal Details", [
      ["Date of Entry (Regular post)", fmtPdf(emp.dateOfEntry)],
      ["Probationary Period Completion", yn(emp.probationaryPeriod, emp.probationaryPeriodDoc)],
      ["Probation Declaration Date", fmtPdf(emp.probationDeclarationDate)],
      ["CLT Completed", yn(emp.cltCompleted, emp.cltCompletedDoc)],
      ["CLT Completion Date", fmtPdf(emp.cltCompletionDate)],
    ]);

    // 5. Education
    if (emp.educationDetails?.length > 0) {
      const eduRows: [string, string][] = [];
      emp.educationDetails.forEach((ed, i) => {
        eduRows.push([`#${i + 1} Level`, ed.level]);
        if (ed.specialization) eduRows.push([`#${i + 1} Specialization`, ed.specialization]);
        eduRows.push([`#${i + 1} Institution`, ed.institution || "—"]);
        eduRows.push([`#${i + 1} Year`, ed.yearOfPassing || "—"]);
        eduRows.push([`#${i + 1} Grade/Percentage`, ed.gradePercentage || "—"]);
      });
      addSection("5. Education Information", eduRows);
    }

    // 6. Personal & Office Address
    addSection("6. Permanent Address (as per SR)", [
      ["Address", emp.address], ["Pin Code", emp.pinCode],
      ["Email", emp.email], ["Phone", emp.phoneNumber],
      ["Telephone", emp.telephoneNumber || "—"],
    ]);
    addSection("6b. Current Address", [
      ["Address", emp.officeAddress], ["Pin Code", emp.officePinCode],
      ["Email", emp.officeEmail], ["Phone", emp.officePhoneNumber],
      ["Telephone", emp.officeTelephoneNumber || "—"],
    ]);

    // 7. Current Working Details
    addSection("7. Current Working Details", [
      ["Designation", emp.currentPostHeld],
      ["Group", `${emp.currentPostGroup} — ${emp.currentPostSubGroup}`],
      ["First Post Held", emp.currentFirstPostHeld || "—"],
      ["Institution Type", emp.currentInstitutionType || "—"],
      ["Institution", emp.currentInstitution],
      ["HFR ID", emp.currentHfrId || "—"],
      ["District", emp.currentDistrict],
      ["Taluk", emp.currentTaluk],
      ["City/Town/Village", emp.currentCityTownVillage],
      ["Area Type", emp.currentAreaType || "—"],
      ["Working Since", fmtPdf(emp.currentWorkingSince)],
      ["CTC/Movement Order/SR Copy", emp.currentServiceDoc || "—"],
    ]);

    // 8. Past Service
    if (emp.pastServices.length > 0) {
      const rows: [string, string][] = [];
      emp.pastServices.forEach((ps, i) => {
        rows.push([`#${i + 1} Designation`, ps.postHeld]);
        rows.push([`#${i + 1} Group`, `${ps.postGroup} — ${ps.postSubGroup}`]);
        rows.push([`#${i + 1} First Post Held`, ps.firstPostHeld || "—"]);
        rows.push([`#${i + 1} Institution Type`, ps.institutionType || "—"]);
        rows.push([`#${i + 1} Institution`, ps.institution]);
        rows.push([`#${i + 1} HFR ID`, ps.hfrId || "—"]);
        rows.push([`#${i + 1} District`, ps.district]);
        if (ps.taluk) rows.push([`#${i + 1} Taluk`, ps.taluk]);
        if (ps.cityTownVillage) rows.push([`#${i + 1} City/Town/Village`, ps.cityTownVillage]);
        rows.push([`#${i + 1} From (Regular posts only)`, fmtPdf(ps.fromDate)]);
        rows.push([`#${i + 1} To`, fmtPdf(ps.toDate)]);
        rows.push([`#${i + 1} Tenure`, ps.tenure]);
      });
      addSection("8. Past Service Details", rows);
    }

    // 9. Spouse Working Details
    if (emp.spouseGovtServant) {
      addSection("9. Spouse Working Details", [
        ["Spouse Govt Servant", yn(true, emp.spouseGovtServantDoc)],
        ["Spouse Designation", emp.spouseDesignation || "—"],
        ["Spouse District", emp.spouseDistrict || "—"],
        ["Spouse Taluk", emp.spouseTaluk || "—"],
        ["Spouse City/Town/Village", emp.spouseCityTownVillage || "—"],
      ]);
    }

    // 10. Special Conditions
    addSection("10. Special Conditions", [
      ["Terminal Illness", yn(emp.terminallyIll, emp.terminallyIllDoc)],
      ["Pregnant / Child < 1 year", yn(emp.pregnantOrChildUnderOne, emp.pregnantOrChildUnderOneDoc)],
      ["Retiring within 2 years", yn(emp.retiringWithinTwoYears, emp.retiringWithinTwoYearsDoc)],
      ["Disability 40%+", yn(emp.childSpouseDisability, emp.childSpouseDisabilityDoc)],
      ["Widow/Divorcee with child < 12", yn(emp.divorceeWidowWithChild, emp.divorceeWidowWithChildDoc)],
      ["NGO Benefits", yn(emp.ngoBenefits, emp.ngoBenefitsDoc)],
    ]);

    // 11. Association (placeholder)

    // 12. Declarations
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
      addSection("12. Declarations", declRows);
    }

    doc.save(`Employee_${emp.kgid || emp.name}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Timebound rows for display ──
  const timeboundEntries: { label: string; checked: boolean; doc: string; date: string }[] = [];
  if (emp.timeboundCategory === "Doctors") {
    timeboundEntries.push({ label: "6 Years", checked: emp.timebound6Years, doc: emp.timebound6YearsDoc, date: emp.timebound6YearsDate });
    timeboundEntries.push({ label: "13 Years", checked: emp.timebound13Years, doc: emp.timebound13YearsDoc, date: emp.timebound13YearsDate });
    timeboundEntries.push({ label: "20 Years", checked: emp.timebound20Years, doc: emp.timebound20YearsDoc, date: emp.timebound20YearsDate });
  } else {
    timeboundEntries.push({ label: "10 Years", checked: emp.timebound10Years, doc: emp.timebound10YearsDoc, date: emp.timebound10YearsDate });
    timeboundEntries.push({ label: "15 Years", checked: emp.timebound15Years, doc: emp.timebound15YearsDoc, date: emp.timebound15YearsDate });
    timeboundEntries.push({ label: "20 Years", checked: emp.timebound20Years, doc: emp.timebound20YearsDoc, date: emp.timebound20YearsDate });
    timeboundEntries.push({ label: "25 Years", checked: emp.timebound25Years, doc: emp.timebound25YearsDoc, date: emp.timebound25YearsDate });
    timeboundEntries.push({ label: "30 Years", checked: emp.timebound30Years, doc: emp.timebound30YearsDoc, date: emp.timebound30YearsDate });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl print:max-w-full print:px-2">
        {/* Back button - hide on print */}
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <button onClick={() => navigate("/employee-list")} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>

        <Card className="p-6 sm:p-8 print:shadow-none print:border-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{emp.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">KGID: {emp.kgid}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/employee/edit/${emp.id}`)} className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-2" disabled={deleting}>
                        <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Employee Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete the record for <strong>{emp.name}</strong> (KGID: {emp.kgid})? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{emp.designationGroup}</Badge>
            </div>
          </div>

          {/* ══════════════ 1. Basic Information ══════════════ */}
          <SectionHeading title="Basic Information" number={1} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.designation} />
            <Field label="Group" value={`${emp.designationGroup} — ${emp.designationSubGroup}`} />
            <Field label="First Post Held" value={emp.firstPostHeld} />
            <Field label="Date of Initial Appointment (Regular post only)" value={fmt(emp.dateOfEntry)} />
            <Field label="Date of Birth" value={fmt(emp.dateOfBirth)} />
            <Field label="Gender" value={emp.gender} />
            <Field label="Recruitment Type" value={emp.recruitmentType} />
            {emp.recruitmentType === "Direct" && emp.directRecruitmentMode && (
              <Field label="Direct Recruitment Mode" value={emp.directRecruitmentMode} />
            )}
            {emp.contractRegularised && (
              <>
                <BoolField label="Contract Regularised" value={true} doc={emp.contractRegularisedDoc} />
                <Field label="Contract Regularised Date" value={fmt(emp.contractRegularisedDate)} />
                <Field label="Contract Joining Date" value={fmt(emp.contractJoiningDate)} />
              </>
            )}
          </div>

          {/* ══════════════ 2. Designation & Medical IDs ══════════════ */}
          <SectionHeading title="Designation & Medical IDs" number={2} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.designation} />
            <Field label="First Post Held" value={emp.firstPostHeld} />
            <BoolField label="Doctor / Nurse / Pharmacist" value={emp.isDoctorNursePharmacist} />
            {emp.isDoctorNursePharmacist && (
              <Field label="HPR ID" value={emp.hprId} />
            )}
            <Field label="HFR ID" value={emp.hfrId} />
          </div>

          {/* ══════════════ 3. Timebound ══════════════ */}
          <SectionHeading title="Timebound" number={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoolField label="Timebound Applicable" value={emp.timeboundApplicable} />
            {emp.timeboundApplicable && (
              <>
                <Field label="Category" value={emp.timeboundCategory} />
                {timeboundEntries.filter(t => t.checked).map((t, i) => (
                  <div key={i} className="col-span-1 sm:col-span-2 bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Field label={`${t.label} Timebound`} value={<span className="text-primary font-medium">Yes</span>} />
                      <Field label="Document" value={t.doc} />
                      <Field label="Date" value={t.date} />
                    </div>
                  </div>
                ))}
              </>
            )}
            <BoolField label="Promotion Rejected" value={emp.promotionRejected} />
            {emp.promotionRejected && (
              <>
                <Field label="Rejected Designation" value={emp.promotionRejectedDesignation} />
                <Field label="Rejected Date" value={fmt(emp.promotionRejectedDate)} />
              </>
            )}
            <BoolField label="PG Bond" value={emp.pgBond} doc={emp.pgBondDoc} />
            {emp.pgBond && (
              <Field label="PG Bond Completion Date" value={fmt(emp.pgBondCompletionDate)} />
            )}
          </div>

          {/* ══════════════ 4. Service & Personal Details ══════════════ */}
          <SectionHeading title="Service & Personal Details" number={4} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Date of Entry into Service (Regular post only)" value={fmt(emp.dateOfEntry)} />
            <BoolField label="Probationary Period Completion" value={emp.probationaryPeriod} doc={emp.probationaryPeriodDoc} />
            <Field label="Probation Declaration Date" value={fmt(emp.probationDeclarationDate)} />
            <BoolField label="CLT Completed" value={emp.cltCompleted} doc={emp.cltCompletedDoc} />
            {emp.cltCompleted && (
              <Field label="CLT Completion Date" value={fmt(emp.cltCompletionDate)} />
            )}
          </div>

          {/* ══════════════ 5. Education Information ══════════════ */}
          <SectionHeading title="Education Information" number={5} />
          {(!emp.educationDetails || emp.educationDetails.length === 0) ? (
            <p className="text-sm text-muted-foreground">No education entries recorded.</p>
          ) : (
            <div className="space-y-4">
              {emp.educationDetails.map((ed, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Education #{idx + 1}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="Level" value={ed.level} />
                    {ed.specialization && <Field label="Specialization" value={ed.specialization} />}
                    <Field label="Institution" value={ed.institution} />
                    <Field label="Year of Passing" value={ed.yearOfPassing} />
                    <Field label="Grade / Percentage" value={ed.gradePercentage} />
                    {ed.documentProof && <Field label="Document Proof" value={ed.documentProof} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════ 6. Address ══════════════ */}
          <SectionHeading title="Personal Address" number={6} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={emp.address} />
            <Field label="Pin Code" value={emp.pinCode} />
            <Field label="Email" value={emp.email} />
            <Field label="Phone Number" value={emp.phoneNumber} />
            {emp.telephoneNumber && <Field label="Telephone" value={emp.telephoneNumber} />}
          </div>

          <SectionHeading title="Office Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={emp.officeAddress} />
            <Field label="Pin Code" value={emp.officePinCode} />
            <Field label="Email" value={emp.officeEmail} />
            <Field label="Phone Number" value={emp.officePhoneNumber} />
            {emp.officeTelephoneNumber && <Field label="Telephone" value={emp.officeTelephoneNumber} />}
          </div>

          {/* ══════════════ 7. Current Working Details ══════════════ */}
          <SectionHeading title="Current Working Details" number={7} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.currentPostHeld} />
            <Field label="Group" value={`${emp.currentPostGroup} — ${emp.currentPostSubGroup}`} />
            <Field label="First Post Held" value={emp.currentFirstPostHeld} />
            <Field label="Institution Type" value={emp.currentInstitutionType} />
            <Field label="Institution" value={emp.currentInstitution} />
            {emp.currentHfrId && <Field label="HFR ID" value={emp.currentHfrId} />}
            <Field label="District" value={emp.currentDistrict} />
            <Field label="Taluk" value={emp.currentTaluk} />
            <Field label="City/Town/Village" value={emp.currentCityTownVillage} />
            <Field label="Area Type" value={emp.currentAreaType} />
            <Field label="Working Since" value={fmt(emp.currentWorkingSince)} />
            {emp.currentServiceDoc && <Field label="CTC / Movement Order / SR Copy" value={emp.currentServiceDoc} />}
          </div>

          {/* ══════════════ 8. Past Service Details ══════════════ */}
          <SectionHeading title="Past Service Details" number={8} />
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
                    <Field label="First Post Held" value={ps.firstPostHeld} />
                    <Field label="Institution Type" value={ps.institutionType} />
                    <Field label="Institution" value={ps.institution} />
                    {ps.hfrId && <Field label="HFR ID" value={ps.hfrId} />}
                    <Field label="District" value={ps.district} />
                    {ps.taluk && <Field label="Taluk" value={ps.taluk} />}
                    {ps.cityTownVillage && <Field label="City/Town/Village" value={ps.cityTownVillage} />}
                    <Field label="From (Regular posts only)" value={fmt(ps.fromDate)} />
                    <Field label="To" value={fmt(ps.toDate)} />
                    <Field label="Tenure" value={ps.tenure} />
                    {emp.pastServiceDocs?.[idx] && <Field label="Document" value={emp.pastServiceDocs[idx]} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════ 9. Spouse Working Details ══════════════ */}
          <SectionHeading title="Spouse Working Details" number={9} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BoolField label="Spouse is Govt Servant" value={emp.spouseGovtServant} doc={emp.spouseGovtServantDoc} />
            {emp.spouseGovtServant && (
              <>
                <Field label="Spouse Designation" value={emp.spouseDesignation} />
                <Field label="Spouse District" value={emp.spouseDistrict} />
                <Field label="Spouse Taluk" value={emp.spouseTaluk} />
                <Field label="Spouse City/Town/Village" value={emp.spouseCityTownVillage} />
              </>
            )}
          </div>

          {/* ══════════════ 10. Special Conditions ══════════════ */}
          <SectionHeading title="Special Conditions" number={10} />
          <div className="grid grid-cols-1 gap-4">
            <BoolField label="Terminal illness / Serious ailment requiring transfer" value={emp.terminallyIll} doc={emp.terminallyIllDoc} />
            <BoolField label="Pregnant or female staff with child less than one year" value={emp.pregnantOrChildUnderOne} doc={emp.pregnantOrChildUnderOneDoc} />
            <BoolField label="Due to retire on superannuation within two years" value={emp.retiringWithinTwoYears} doc={emp.retiringWithinTwoYearsDoc} />
            <BoolField label="Staff/Spouse/Child with 40%+ disability" value={emp.childSpouseDisability} doc={emp.childSpouseDisabilityDoc} />
            <BoolField label="Widow/Widower/Divorcee with children less than 12 years" value={emp.divorceeWidowWithChild} doc={emp.divorceeWidowWithChildDoc} />
            <BoolField label="NGO Benefits" value={emp.ngoBenefits} doc={emp.ngoBenefitsDoc} />
          </div>

          {/* ══════════════ 11. Association Details (placeholder) ══════════════ */}
          {/* Section 11 - Karnataka State Government Employee association - not yet in data model */}

          {/* ══════════════ 12. Declarations ══════════════ */}
          {emp.empDeclAgreed && (
            <>
              <SectionHeading title="Employee Declaration" number={12} />
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

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border print:hidden">
        © 2026 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeView;
