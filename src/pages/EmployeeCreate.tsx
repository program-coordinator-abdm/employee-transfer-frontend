import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react";
import FormPreview, { type FormPreviewData } from "@/components/FormPreview";
import Header from "@/components/Header";
import PositionDropdown from "@/components/PositionDropdown";
import DatePickerField, { calculateTenure } from "@/components/DatePickerField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { KARNATAKA_DISTRICTS, type PositionInfo } from "@/lib/positions";
import { saveEmployee, updateEmployee, getEmployeeById, type NewEmployee, type PastServiceEntry } from "@/lib/employeeStorage";
import Toast, { useToastState } from "@/components/Toast";

interface FormErrors {
  [key: string]: string;
}

const EMPTY_PAST_SERVICE: () => PastServiceEntry = () => ({
  postHeld: "", postGroup: "", postSubGroup: "",
  institution: "", district: "", taluk: "", cityTownVillage: "",
  fromDate: "", toDate: "", tenure: "",
});

const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = !!editId;
  const { toast, showToast, hideToast } = useToastState();
  const [errors, setErrors] = useState<FormErrors>({});
  // formStep: "fill" → "preview" → "declare"
  const [formStep, setFormStep] = useState<"fill" | "preview" | "declare">("fill");
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Basic fields
  const [kgid, setKgid] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designationGroup, setDesignationGroup] = useState("");
  const [designationSubGroup, setDesignationSubGroup] = useState("");
  const [dateOfEntry, setDateOfEntry] = useState<Date>();
  const [gender, setGender] = useState("");
  const [probationaryPeriod, setProbationaryPeriod] = useState(false);
  const [probationaryPeriodDoc, setProbationaryPeriodDoc] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

  // Personal Address
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");

  // Office Address
  const [officeAddress, setOfficeAddress] = useState("");
  const [officePinCode, setOfficePinCode] = useState("");
  const [officeEmail, setOfficeEmail] = useState("");
  const [officePhoneNumber, setOfficePhoneNumber] = useState("");
  const [officeTelephoneNumber, setOfficeTelephoneNumber] = useState("");

  // Current working
  const [currentPostHeld, setCurrentPostHeld] = useState("");
  const [currentPostGroup, setCurrentPostGroup] = useState("");
  const [currentPostSubGroup, setCurrentPostSubGroup] = useState("");
  const [currentInstitution, setCurrentInstitution] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [currentTaluk, setCurrentTaluk] = useState("");
  const [currentCityTownVillage, setCurrentCityTownVillage] = useState("");
  const [currentWorkingSince, setCurrentWorkingSince] = useState<Date>();

  // Past services
  const [pastServices, setPastServices] = useState<PastServiceEntry[]>([EMPTY_PAST_SERVICE()]);
  const [pastFromDates, setPastFromDates] = useState<(Date | undefined)[]>([undefined]);
  const [pastToDates, setPastToDates] = useState<(Date | undefined)[]>([undefined]);

  // Conditional fields
  const [terminallyIll, setTerminallyIll] = useState(false);
  const [terminallyIllDoc, setTerminallyIllDoc] = useState("");
  const [pregnantOrChildUnderOne, setPregnantOrChildUnderOne] = useState(false);
  const [pregnantOrChildUnderOneDoc, setPregnantOrChildUnderOneDoc] = useState("");
  const [retiringWithinTwoYears, setRetiringWithinTwoYears] = useState(false);
  const [retiringWithinTwoYearsDoc, setRetiringWithinTwoYearsDoc] = useState("");
  const [childSpouseDisability, setChildSpouseDisability] = useState(false);
  const [childSpouseDisabilityDoc, setChildSpouseDisabilityDoc] = useState("");
  const [divorceeWidowWithChild, setDivorceeWidowWithChild] = useState(false);
  const [divorceeWidowWithChildDoc, setDivorceeWidowWithChildDoc] = useState("");
  const [spouseGovtServant, setSpouseGovtServant] = useState(false);
  const [spouseGovtServantDoc, setSpouseGovtServantDoc] = useState("");

  // Declaration
  const [empDeclAgreed, setEmpDeclAgreed] = useState(false);
  const [empDeclName, setEmpDeclName] = useState("");
  const [empDeclDate, setEmpDeclDate] = useState<Date>();
  const [officerDeclAgreed, setOfficerDeclAgreed] = useState(false);
  const [officerDeclName, setOfficerDeclName] = useState("");
  const [officerDeclDate, setOfficerDeclDate] = useState<Date>();

  // Load existing employee data in edit mode
  useEffect(() => {
    if (!editId) return;
    const existing = getEmployeeById(editId);
    if (!existing) return;
    setKgid(existing.kgid); setName(existing.name);
    setDesignation(existing.designation); setDesignationGroup(existing.designationGroup); setDesignationSubGroup(existing.designationSubGroup);
    setDateOfEntry(new Date(existing.dateOfEntry)); setGender(existing.gender);
    setProbationaryPeriod(existing.probationaryPeriod); setProbationaryPeriodDoc(existing.probationaryPeriodDoc);
    setDateOfBirth(new Date(existing.dateOfBirth));
    setAddress(existing.address); setPinCode(existing.pinCode); setEmail(existing.email);
    setPhoneNumber(existing.phoneNumber); setTelephoneNumber(existing.telephoneNumber);
    setOfficeAddress(existing.officeAddress); setOfficePinCode(existing.officePinCode);
    setOfficeEmail(existing.officeEmail); setOfficePhoneNumber(existing.officePhoneNumber);
    setOfficeTelephoneNumber(existing.officeTelephoneNumber);
    setCurrentPostHeld(existing.currentPostHeld); setCurrentPostGroup(existing.currentPostGroup);
    setCurrentPostSubGroup(existing.currentPostSubGroup); setCurrentInstitution(existing.currentInstitution);
    setCurrentDistrict(existing.currentDistrict); setCurrentTaluk(existing.currentTaluk);
    setCurrentCityTownVillage(existing.currentCityTownVillage);
    setCurrentWorkingSince(new Date(existing.currentWorkingSince));
    setPastServices(existing.pastServices);
    setPastFromDates(existing.pastServices.map(s => s.fromDate ? new Date(s.fromDate) : undefined));
    setPastToDates(existing.pastServices.map(s => s.toDate ? new Date(s.toDate) : undefined));
    setTerminallyIll(existing.terminallyIll); setTerminallyIllDoc(existing.terminallyIllDoc);
    setPregnantOrChildUnderOne(existing.pregnantOrChildUnderOne); setPregnantOrChildUnderOneDoc(existing.pregnantOrChildUnderOneDoc);
    setRetiringWithinTwoYears(existing.retiringWithinTwoYears); setRetiringWithinTwoYearsDoc(existing.retiringWithinTwoYearsDoc);
    setChildSpouseDisability(existing.childSpouseDisability); setChildSpouseDisabilityDoc(existing.childSpouseDisabilityDoc);
    setDivorceeWidowWithChild(existing.divorceeWidowWithChild); setDivorceeWidowWithChildDoc(existing.divorceeWidowWithChildDoc);
    setSpouseGovtServant(existing.spouseGovtServant); setSpouseGovtServantDoc(existing.spouseGovtServantDoc);
    setEmpDeclAgreed(existing.empDeclAgreed); setEmpDeclName(existing.empDeclName);
    if (existing.empDeclDate) setEmpDeclDate(new Date(existing.empDeclDate));
    setOfficerDeclAgreed(existing.officerDeclAgreed); setOfficerDeclName(existing.officerDeclName);
    if (existing.officerDeclDate) setOfficerDeclDate(new Date(existing.officerDeclDate));
  }, [editId]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const addPastService = () => {
    setPastServices([...pastServices, EMPTY_PAST_SERVICE()]);
    setPastFromDates([...pastFromDates, undefined]);
    setPastToDates([...pastToDates, undefined]);
  };

  const removePastService = (idx: number) => {
    setPastServices(pastServices.filter((_, i) => i !== idx));
    setPastFromDates(pastFromDates.filter((_, i) => i !== idx));
    setPastToDates(pastToDates.filter((_, i) => i !== idx));
  };

  const updatePastService = (idx: number, field: keyof PastServiceEntry, value: string) => {
    setPastServices(pastServices.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const updatePastServicePosition = (idx: number, pos: PositionInfo | null) => {
    setPastServices(pastServices.map((s, i) =>
      i === idx ? { ...s, postHeld: pos?.name || "", postGroup: pos?.group || "", postSubGroup: pos?.subGroup || "" } : s
    ));
  };

  const updatePastFromDate = (idx: number, date: Date | undefined) => {
    const newDates = [...pastFromDates];
    newDates[idx] = date;
    setPastFromDates(newDates);
    const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
    const tenure = (date && pastToDates[idx]) ? calculateTenure(date, pastToDates[idx]!) : "";
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, fromDate: dateStr, tenure } : s));
  };

  const updatePastToDate = (idx: number, date: Date | undefined) => {
    const newDates = [...pastToDates];
    newDates[idx] = date;
    setPastToDates(newDates);
    const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
    const tenure = (pastFromDates[idx] && date) ? calculateTenure(pastFromDates[idx]!, date) : "";
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, toDate: dateStr, tenure } : s));
  };

  const validateSections1to7 = (): boolean => {
    const errs: FormErrors = {};
    if (!kgid.trim()) errs.kgid = "KGID Number is required";
    if (!name.trim()) errs.name = "Employee Name is required";
    else if (!/^[a-zA-Z\s.]+$/.test(name)) errs.name = "Only alphabetic characters allowed";
    if (!designation) errs.designation = "Designation is required";
    if (!dateOfEntry) errs.dateOfEntry = "Date of entry is required";
    if (!gender) errs.gender = "Gender is required";
    if (!dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!pinCode.trim()) errs.pinCode = "Pin code is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (!officeAddress.trim()) errs.officeAddress = "Office address is required";
    if (!officePinCode.trim()) errs.officePinCode = "Office pin code is required";
    if (!officeEmail.trim()) errs.officeEmail = "Office email is required";
    if (!officePhoneNumber.trim()) errs.officePhoneNumber = "Office phone number is required";
    if (!currentPostHeld) errs.currentPostHeld = "Current post is required";
    if (!currentInstitution.trim()) errs.currentInstitution = "Institution is required";
    if (!currentDistrict) errs.currentDistrict = "District is required";
    if (!currentTaluk.trim()) errs.currentTaluk = "Taluk is required";
    if (!currentCityTownVillage.trim()) errs.currentCityTownVillage = "City/Town/Village is required";
    if (!currentWorkingSince) errs.currentWorkingSince = "Working since date is required";
    if (terminallyIll && !terminallyIllDoc) errs.terminallyIllDoc = "Documentary proof is required";
    if (pregnantOrChildUnderOne && !pregnantOrChildUnderOneDoc) errs.pregnantOrChildUnderOneDoc = "Documentary proof is required";
    if (retiringWithinTwoYears && !retiringWithinTwoYearsDoc) errs.retiringWithinTwoYearsDoc = "Documentary proof is required";
    if (childSpouseDisability && !childSpouseDisabilityDoc) errs.childSpouseDisabilityDoc = "Documentary proof is required";
    if (divorceeWidowWithChild && !divorceeWidowWithChildDoc) errs.divorceeWidowWithChildDoc = "Documentary proof is required";
    if (spouseGovtServant && !spouseGovtServantDoc) errs.spouseGovtServantDoc = "Documentary proof is required";
    if (probationaryPeriod && !probationaryPeriodDoc) errs.probationaryPeriodDoc = "Documentary proof is required";

    pastServices.forEach((s, i) => {
      if (!s.postHeld) errs[`past_${i}_postHeld`] = "Post is required";
      if (!s.institution) errs[`past_${i}_institution`] = "Institution is required";
      if (!s.district) errs[`past_${i}_district`] = "District is required";
      if (!s.fromDate) errs[`past_${i}_fromDate`] = "From date is required";
      if (!s.toDate) errs[`past_${i}_toDate`] = "To date is required";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!empDeclAgreed) errs.empDeclAgreed = "Employee declaration must be accepted";
    if (empDeclAgreed && !empDeclName.trim()) errs.empDeclName = "Employee signature name is required";
    if (empDeclAgreed && !empDeclDate) errs.empDeclDate = "Employee signature date is required";
    if (!officerDeclAgreed) errs.officerDeclAgreed = "Reporting officer declaration must be accepted";
    if (officerDeclAgreed && !officerDeclName.trim()) errs.officerDeclName = "Officer signature name is required";
    if (officerDeclAgreed && !officerDeclDate) errs.officerDeclDate = "Officer signature date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePreview = () => {
    if (!validateSections1to7()) {
      showToast("Please fill all required fields before preview", "error");
      return;
    }
    setFormStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditSection = (section: number) => {
    setEditingSection(section);
    setFormStep("fill");
    setTimeout(() => {
      sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBackToPreview = () => {
    if (!validateSections1to7()) {
      showToast("Please fix errors before returning to preview", "error");
      return;
    }
    setEditingSection(null);
    setFormStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPreviewData = (): FormPreviewData => ({
    kgid, name, designation, designationGroup, designationSubGroup,
    dateOfEntry, gender, probationaryPeriod, probationaryPeriodDoc, dateOfBirth,
    address, pinCode, email, phoneNumber, telephoneNumber,
    officeAddress, officePinCode, officeEmail, officePhoneNumber, officeTelephoneNumber,
    currentPostHeld, currentPostGroup, currentPostSubGroup,
    currentInstitution, currentDistrict, currentTaluk, currentCityTownVillage,
    currentWorkingSince, pastServices,
    terminallyIll, terminallyIllDoc,
    pregnantOrChildUnderOne, pregnantOrChildUnderOneDoc,
    retiringWithinTwoYears, retiringWithinTwoYearsDoc,
    childSpouseDisability, childSpouseDisabilityDoc,
    divorceeWidowWithChild, divorceeWidowWithChildDoc,
    spouseGovtServant, spouseGovtServantDoc,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const emp: NewEmployee = {
      id: isEditMode ? editId : Date.now().toString(),
      kgid, name, designation, designationGroup, designationSubGroup,
      dateOfEntry: dateOfEntry!.toISOString(),
      gender, probationaryPeriod, probationaryPeriodDoc,
      dateOfBirth: dateOfBirth!.toISOString(),
      address, pinCode, email, phoneNumber, telephoneNumber,
      officeAddress, officePinCode, officeEmail, officePhoneNumber, officeTelephoneNumber,
      currentPostHeld, currentPostGroup, currentPostSubGroup,
      currentInstitution, currentDistrict, currentTaluk, currentCityTownVillage,
      currentWorkingSince: currentWorkingSince!.toISOString(),
      pastServices, terminallyIll, terminallyIllDoc,
      pregnantOrChildUnderOne, pregnantOrChildUnderOneDoc,
      retiringWithinTwoYears, retiringWithinTwoYearsDoc,
      childSpouseDisability, childSpouseDisabilityDoc,
      divorceeWidowWithChild, divorceeWidowWithChildDoc,
      spouseGovtServant, spouseGovtServantDoc,
      empDeclAgreed, empDeclName, empDeclDate: empDeclDate?.toISOString() || "",
      officerDeclAgreed, officerDeclName, officerDeclDate: officerDeclDate?.toISOString() || "",
      createdAt: isEditMode ? (getEmployeeById(editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
    if (isEditMode) {
      updateEmployee(emp);
      showToast("Employee updated successfully!", "success");
    } else {
      saveEmployee(emp);
      showToast("Employee created successfully!", "success");
    }
    setTimeout(() => navigate("/employee-list"), 1200);
  };

  const SectionTitle: React.FC<{ number: string; title: string }> = ({ number, title }) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{number}</span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );

  const FieldError: React.FC<{ error?: string }> = ({ error }) =>
    error ? <p className="input-error mt-1">{error}</p> : null;

  const shouldShowSection = (n: number) =>
    formStep === "fill" && (editingSection === null || editingSection === n);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => {
            if (formStep === "fill" && editingSection !== null) {
              handleBackToPreview();
            } else if (formStep === "declare") {
              setFormStep("preview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate(isEditMode ? "/employee-list" : "/data-officer");
            }
          }} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> {formStep === "fill" && editingSection !== null ? "Back to Preview" : formStep === "declare" ? "Back to Preview" : "Back"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {formStep === "preview" ? "Preview Details" : formStep === "declare" ? "Declaration & Submit" : editingSection !== null ? `Edit Section ${editingSection}` : isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formStep === "preview" ? "Review all details before proceeding to declaration" : formStep === "declare" ? "Sign declarations and submit" : "Fill in all required details to register an employee"}
            </p>
          </div>
        </div>

        {/* PREVIEW MODE */}
        {formStep === "preview" && (
          <FormPreview
            data={getPreviewData()}
            onEdit={handleEditSection}
            onProceed={() => { setFormStep("declare"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

        <form onSubmit={handleSubmit} className={cn("space-y-6", formStep === "preview" && "hidden")}>
          {/* 1. KGID & Name */}
          <div className={cn(!shouldShowSection(1) && "hidden")} ref={el => { sectionRefs.current[1] = el; }}>
          <Card className="p-6">
            <SectionTitle number="1" title="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">KGID Number <span className="text-destructive">*</span></label>
                <input value={kgid} onChange={(e) => { setKgid(e.target.value); clearError("kgid"); }} className={`input-field ${errors.kgid ? "border-destructive" : ""}`} placeholder="e.g. KG123456" />
                <FieldError error={errors.kgid} />
              </div>
              <div>
                <label className="input-label">Employee Name <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z\s.]/g, "").toUpperCase(); setName(v); clearError("name"); }} className={`input-field ${errors.name ? "border-destructive" : ""}`} placeholder="Full name (alphabetic only)" />
                <FieldError error={errors.name} />
              </div>
            </div>
          </Card>
          </div>

          {/* 2. Designation */}
          <div className={cn(!shouldShowSection(2) && "hidden")} ref={el => { sectionRefs.current[2] = el; }}>
          <Card className="p-6">
            <SectionTitle number="2" title="Designation" />
            <div>
              <label className="input-label">Designation <span className="text-destructive">*</span></label>
              <PositionDropdown
                value={designation}
                onChange={(pos) => {
                  setDesignation(pos?.name || "");
                  setDesignationGroup(pos?.group || "");
                  setDesignationSubGroup(pos?.subGroup || "");
                  clearError("designation");
                }}
              />
              {designation && (
                <p className="text-xs text-primary mt-1.5 font-medium">
                  {designationGroup} — {designationSubGroup}
                </p>
              )}
              <FieldError error={errors.designation} />
            </div>
          </Card>
          </div>

          {/* 3. Service & Personal */}
          <div className={cn(!shouldShowSection(3) && "hidden")} ref={el => { sectionRefs.current[3] = el; }}>
          <Card className="p-6">
            <SectionTitle number="3" title="Service & Personal Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Date of Entry into Service <span className="text-destructive">*</span></label>
                <DatePickerField value={dateOfEntry} onChange={(d) => { setDateOfEntry(d); clearError("dateOfEntry"); }} placeholder="Select date" disabled={(d) => d > new Date()} />
                <FieldError error={errors.dateOfEntry} />
              </div>
              <div>
                <label className="input-label">Date of Birth <span className="text-destructive">*</span></label>
                <DatePickerField value={dateOfBirth} onChange={(d) => { setDateOfBirth(d); clearError("dateOfBirth"); }} placeholder="Select date of birth" disabled={(d) => d > new Date()} />
                <FieldError error={errors.dateOfBirth} />
              </div>
              <div>
                <label className="input-label">Gender <span className="text-destructive">*</span></label>
                <div className="flex gap-2 mt-1">
                  {["Male", "Female"].map((g) => (
                    <button key={g} type="button"
                      onClick={() => { setGender(g); clearError("gender"); }}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                        gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <FieldError error={errors.gender} />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="probation" className="text-sm font-medium">Probationary Period</Label>
                  <Switch id="probation" checked={probationaryPeriod} onCheckedChange={setProbationaryPeriod} />
                  <span className="text-sm text-muted-foreground">{probationaryPeriod ? "Yes" : "No"}</span>
                </div>
                {probationaryPeriod && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setProbationaryPeriodDoc(e.target.files?.[0]?.name || ""); clearError("probationaryPeriodDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.probationaryPeriodDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", probationaryPeriodDoc ? "text-foreground" : "text-muted-foreground")}>
                          {probationaryPeriodDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.probationaryPeriodDoc} />
                  </div>
                )}
              </div>
            </div>
          </Card>
          </div>

          {/* 4. Communication Address */}
          <div className={cn(!shouldShowSection(4) && "hidden")} ref={el => { sectionRefs.current[4] = el; }}>
          <Card className="p-6">
            <SectionTitle number="4" title="Communication Address" />

            {/* Personal Address */}
            <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Personal Address</h4>
            <div className="space-y-4 mb-6">
              <div>
                <label className="input-label">Address <span className="text-destructive">*</span></label>
                <textarea value={address} onChange={(e) => { setAddress(e.target.value); clearError("address"); }} className={`input-field min-h-[80px] resize-y ${errors.address ? "border-destructive" : ""}`} placeholder="Full personal address" />
                <FieldError error={errors.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Pin Code <span className="text-destructive">*</span></label>
                  <input value={pinCode} onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("pinCode"); }} className={`input-field ${errors.pinCode ? "border-destructive" : ""}`} placeholder="6-digit" maxLength={6} />
                  <FieldError error={errors.pinCode} />
                </div>
                <div>
                  <label className="input-label">Email ID <span className="text-destructive">*</span></label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className={`input-field ${errors.email ? "border-destructive" : ""}`} placeholder="email@example.com" />
                  <FieldError error={errors.email} />
                </div>
                <div>
                  <label className="input-label">Phone Number <span className="text-destructive">*</span></label>
                  <input value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("phoneNumber"); }} className={`input-field ${errors.phoneNumber ? "border-destructive" : ""}`} placeholder="10-digit mobile" maxLength={10} />
                  <FieldError error={errors.phoneNumber} />
                </div>
                <div>
                  <label className="input-label">Telephone Number</label>
                  <input value={telephoneNumber} onChange={(e) => setTelephoneNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} className="input-field" placeholder="With STD code" maxLength={12} />
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Office Address */}
            <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Office Address</h4>
            <div className="space-y-4">
              <div>
                <label className="input-label">Address <span className="text-destructive">*</span></label>
                <textarea value={officeAddress} onChange={(e) => { setOfficeAddress(e.target.value); clearError("officeAddress"); }} className={`input-field min-h-[80px] resize-y ${errors.officeAddress ? "border-destructive" : ""}`} placeholder="Full office address" />
                <FieldError error={errors.officeAddress} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Pin Code <span className="text-destructive">*</span></label>
                  <input value={officePinCode} onChange={(e) => { setOfficePinCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("officePinCode"); }} className={`input-field ${errors.officePinCode ? "border-destructive" : ""}`} placeholder="6-digit" maxLength={6} />
                  <FieldError error={errors.officePinCode} />
                </div>
                <div>
                  <label className="input-label">Email ID <span className="text-destructive">*</span></label>
                  <input type="email" value={officeEmail} onChange={(e) => { setOfficeEmail(e.target.value); clearError("officeEmail"); }} className={`input-field ${errors.officeEmail ? "border-destructive" : ""}`} placeholder="office@example.com" />
                  <FieldError error={errors.officeEmail} />
                </div>
                <div>
                  <label className="input-label">Phone Number <span className="text-destructive">*</span></label>
                  <input value={officePhoneNumber} onChange={(e) => { setOfficePhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("officePhoneNumber"); }} className={`input-field ${errors.officePhoneNumber ? "border-destructive" : ""}`} placeholder="10-digit mobile" maxLength={10} />
                  <FieldError error={errors.officePhoneNumber} />
                </div>
                <div>
                  <label className="input-label">Telephone Number</label>
                  <input value={officeTelephoneNumber} onChange={(e) => setOfficeTelephoneNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} className="input-field" placeholder="With STD code" maxLength={12} />
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* 5. Current Working Details */}
          <div className={cn(!shouldShowSection(5) && "hidden")} ref={el => { sectionRefs.current[5] = el; }}>
          <Card className="p-6">
            <SectionTitle number="5" title="Current Working Details" />
            <div className="space-y-4">
              <div>
                <label className="input-label">Post Held <span className="text-destructive">*</span></label>
                <PositionDropdown
                  value={currentPostHeld}
                  onChange={(pos) => {
                    setCurrentPostHeld(pos?.name || "");
                    setCurrentPostGroup(pos?.group || "");
                    setCurrentPostSubGroup(pos?.subGroup || "");
                    clearError("currentPostHeld");
                  }}
                  placeholder="Select current post..."
                />
                {currentPostHeld && <p className="text-xs text-primary mt-1 font-medium">{currentPostGroup} — {currentPostSubGroup}</p>}
                <FieldError error={errors.currentPostHeld} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Name of Institution <span className="text-destructive">*</span></label>
                  <input value={currentInstitution} onChange={(e) => { setCurrentInstitution(e.target.value); clearError("currentInstitution"); }} className={`input-field ${errors.currentInstitution ? "border-destructive" : ""}`} placeholder="Institution name" />
                  <FieldError error={errors.currentInstitution} />
                </div>
                <div>
                  <label className="input-label">District <span className="text-destructive">*</span></label>
                  <select value={currentDistrict} onChange={(e) => { setCurrentDistrict(e.target.value); clearError("currentDistrict"); }} className={`input-field ${errors.currentDistrict ? "border-destructive" : ""}`}>
                    <option value="">Select District</option>
                    {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <FieldError error={errors.currentDistrict} />
                </div>
                <div>
                  <label className="input-label">Taluk <span className="text-destructive">*</span></label>
                  <input value={currentTaluk} onChange={(e) => { setCurrentTaluk(e.target.value); clearError("currentTaluk"); }} className={`input-field ${errors.currentTaluk ? "border-destructive" : ""}`} placeholder="Taluk name" />
                  <FieldError error={errors.currentTaluk} />
                </div>
                <div>
                  <label className="input-label">City / Town / Village <span className="text-destructive">*</span></label>
                  <input value={currentCityTownVillage} onChange={(e) => { setCurrentCityTownVillage(e.target.value); clearError("currentCityTownVillage"); }} className={`input-field ${errors.currentCityTownVillage ? "border-destructive" : ""}`} placeholder="City/Town/Village" />
                  <FieldError error={errors.currentCityTownVillage} />
                </div>
              </div>
              <div className="max-w-sm">
                <label className="input-label">Working in this post since <span className="text-destructive">*</span></label>
                <DatePickerField value={currentWorkingSince} onChange={(d) => { setCurrentWorkingSince(d); clearError("currentWorkingSince"); }} placeholder="Select date" disabled={(d) => d > new Date()} />
                <FieldError error={errors.currentWorkingSince} />
              </div>
            </div>
          </Card>
          </div>

          {/* 6. Past Service Details */}
          <div className={cn(!shouldShowSection(6) && "hidden")} ref={el => { sectionRefs.current[6] = el; }}>
          <Card className="p-6">
            <SectionTitle number="6" title="Past Service Details" />
            <div className="space-y-6">
              {pastServices.map((service, idx) => (
                <div key={idx} className="relative bg-muted/30 rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Service Entry #{idx + 1}</span>
                    {pastServices.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePastService(idx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Post Held <span className="text-destructive">*</span></label>
                      <PositionDropdown
                        value={service.postHeld}
                        onChange={(pos) => updatePastServicePosition(idx, pos)}
                        placeholder="Select post..."
                      />
                      {service.postHeld && <p className="text-xs text-primary mt-1 font-medium">{service.postGroup} — {service.postSubGroup}</p>}
                      <FieldError error={errors[`past_${idx}_postHeld`]} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Name of Institution <span className="text-destructive">*</span></label>
                        <input value={service.institution} onChange={(e) => updatePastService(idx, "institution", e.target.value)} className={`input-field ${errors[`past_${idx}_institution`] ? "border-destructive" : ""}`} placeholder="Institution name" />
                        <FieldError error={errors[`past_${idx}_institution`]} />
                      </div>
                      <div>
                        <label className="input-label">District <span className="text-destructive">*</span></label>
                        <select value={service.district} onChange={(e) => updatePastService(idx, "district", e.target.value)} className={`input-field ${errors[`past_${idx}_district`] ? "border-destructive" : ""}`}>
                          <option value="">Select District</option>
                          {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <FieldError error={errors[`past_${idx}_district`]} />
                      </div>
                      <div>
                        <label className="input-label">Taluk</label>
                        <input value={service.taluk} onChange={(e) => updatePastService(idx, "taluk", e.target.value)} className="input-field" placeholder="Taluk name" />
                      </div>
                      <div>
                        <label className="input-label">City / Town / Village</label>
                        <input value={service.cityTownVillage} onChange={(e) => updatePastService(idx, "cityTownVillage", e.target.value)} className="input-field" placeholder="City/Town/Village" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="input-label">From Date <span className="text-destructive">*</span></label>
                        <DatePickerField value={pastFromDates[idx]} onChange={(d) => updatePastFromDate(idx, d)} placeholder="From" disabled={(d) => d > new Date()} />
                        <FieldError error={errors[`past_${idx}_fromDate`]} />
                      </div>
                      <div>
                        <label className="input-label">To Date <span className="text-destructive">*</span></label>
                        <DatePickerField value={pastToDates[idx]} onChange={(d) => updatePastToDate(idx, d)} placeholder="To" disabled={(d) => d > new Date()} />
                        <FieldError error={errors[`past_${idx}_toDate`]} />
                      </div>
                      <div>
                        <label className="input-label">Tenure</label>
                        <div className="input-field bg-muted/50 flex items-center text-sm font-medium text-foreground">
                          {service.tenure || "Auto-calculated"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPastService} className="w-full border-dashed border-2 border-primary/40 text-primary hover:bg-primary/5">
                <Plus className="w-4 h-4 mr-2" /> Add Another Past Service Entry
              </Button>
            </div>
          </Card>
          </div>

          {/* 7. Special Conditions */}
          <div className={cn(!shouldShowSection(7) && "hidden")} ref={el => { sectionRefs.current[7] = el; }}>
          <Card className="p-6">
            <SectionTitle number="7" title="Special Conditions" />
            <div className="space-y-5">
              {/* 1. Terminal Illness */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer or staff or spouse or child declared as dependent under the KCS Medical Attendance Rules is suffering from terminal illness or serious ailments for which treatment is not available at the place of work and transfer is necessary to a place where such treatment is available</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={terminallyIll} onCheckedChange={setTerminallyIll} />
                    <span className="text-sm text-muted-foreground w-8">{terminallyIll ? "Yes" : "No"}</span>
                  </div>
                </div>
                {terminallyIll && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setTerminallyIllDoc(e.target.files?.[0]?.name || ""); clearError("terminallyIllDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.terminallyIllDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", terminallyIllDoc ? "text-foreground" : "text-muted-foreground")}>
                          {terminallyIllDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.terminallyIllDoc} />
                  </div>
                )}
              </div>

              {/* 2. Pregnant / Child under 1 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Pregnant or a female medical officer or staff with a child of less than one year of age</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={pregnantOrChildUnderOne} onCheckedChange={setPregnantOrChildUnderOne} />
                    <span className="text-sm text-muted-foreground w-8">{pregnantOrChildUnderOne ? "Yes" : "No"}</span>
                  </div>
                </div>
                {pregnantOrChildUnderOne && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setPregnantOrChildUnderOneDoc(e.target.files?.[0]?.name || ""); clearError("pregnantOrChildUnderOneDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.pregnantOrChildUnderOneDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", pregnantOrChildUnderOneDoc ? "text-foreground" : "text-muted-foreground")}>
                          {pregnantOrChildUnderOneDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.pregnantOrChildUnderOneDoc} />
                  </div>
                )}
              </div>

              {/* 3. Retiring within 2 years */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer or staff who are due to retire on superannuation within two years</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={retiringWithinTwoYears} onCheckedChange={setRetiringWithinTwoYears} />
                    <span className="text-sm text-muted-foreground w-8">{retiringWithinTwoYears ? "Yes" : "No"}</span>
                  </div>
                </div>
                {retiringWithinTwoYears && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setRetiringWithinTwoYearsDoc(e.target.files?.[0]?.name || ""); clearError("retiringWithinTwoYearsDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.retiringWithinTwoYearsDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", retiringWithinTwoYearsDoc ? "text-foreground" : "text-muted-foreground")}>
                          {retiringWithinTwoYearsDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.retiringWithinTwoYearsDoc} />
                  </div>
                )}
              </div>

              {/* 4. Disability 40%+ */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer/staff or spouse or child with disability of 40% or more</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={childSpouseDisability} onCheckedChange={setChildSpouseDisability} />
                    <span className="text-sm text-muted-foreground w-8">{childSpouseDisability ? "Yes" : "No"}</span>
                  </div>
                </div>
                {childSpouseDisability && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setChildSpouseDisabilityDoc(e.target.files?.[0]?.name || ""); clearError("childSpouseDisabilityDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.childSpouseDisabilityDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", childSpouseDisabilityDoc ? "text-foreground" : "text-muted-foreground")}>
                          {childSpouseDisabilityDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.childSpouseDisabilityDoc} />
                  </div>
                )}
              </div>

              {/* 5. Widow/Widower/Divorcee with children < 12 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Widow or Widower or divorcee Medical officer or staff with children less than 12 years of age</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={divorceeWidowWithChild} onCheckedChange={setDivorceeWidowWithChild} />
                    <span className="text-sm text-muted-foreground w-8">{divorceeWidowWithChild ? "Yes" : "No"}</span>
                  </div>
                </div>
                {divorceeWidowWithChild && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setDivorceeWidowWithChildDoc(e.target.files?.[0]?.name || ""); clearError("divorceeWidowWithChildDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.divorceeWidowWithChildDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", divorceeWidowWithChildDoc ? "text-foreground" : "text-muted-foreground")}>
                          {divorceeWidowWithChildDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.divorceeWidowWithChildDoc} />
                  </div>
                )}
              </div>

              {/* 6. Spouse Govt Servant */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical Officer or the staff being married to an employee of a Central Government or State Government or Aided Institution</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={spouseGovtServant} onCheckedChange={setSpouseGovtServant} />
                    <span className="text-sm text-muted-foreground w-8">{spouseGovtServant ? "Yes" : "No"}</span>
                  </div>
                </div>
                {spouseGovtServant && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg" className="hidden" onChange={(e) => { setSpouseGovtServantDoc(e.target.files?.[0]?.name || ""); clearError("spouseGovtServantDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.spouseGovtServantDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", spouseGovtServantDoc ? "text-foreground" : "text-muted-foreground")}>
                          {spouseGovtServantDoc || "Choose file (PDF, DOC, DOCX, JPG, JPEG)..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.spouseGovtServantDoc} />
                  </div>
                )}
              </div>
            </div>
          </Card>
          </div>

          {/* Preview & Print button — shown when filling, not editing a single section */}
          {formStep === "fill" && editingSection === null && (
            <div className="flex items-center justify-end gap-3 pb-8">
              <button type="button" onClick={() => navigate("/categories")} className="btn-ghost px-8 py-3">Cancel</button>
              <button type="button" onClick={handlePreview} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                Preview & Print
              </button>
            </div>
          )}

          {/* Back to Preview button — shown when editing a single section */}
          {formStep === "fill" && editingSection !== null && (
            <div className="flex items-center justify-end gap-3 pb-8">
              <button type="button" onClick={handleBackToPreview} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                Save & Back to Preview
              </button>
            </div>
          )}

          {/* 8. Declaration — only shown in declare step */}
          <div className={cn(formStep !== "declare" && "hidden")}>
          <Card className="p-6">
            <SectionTitle number="8" title="Declaration" />

            {/* Employee Declaration */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-foreground mb-3">Employee Declaration</h4>
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground leading-relaxed">
                  I hereby declare that the details provided in this form are true and correct to the best of my knowledge. If false information is provided, I shall be liable for disciplinary action attracting major penalty as per the provisions of the <span className="font-semibold">Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Switch checked={empDeclAgreed} onCheckedChange={setEmpDeclAgreed} id="empDeclAgreed" />
                <Label htmlFor="empDeclAgreed" className="text-sm font-medium cursor-pointer">I agree to the above declaration</Label>
              </div>
              {errors.empDeclAgreed && <p className="text-sm text-destructive mb-3">{errors.empDeclAgreed}</p>}
              {empDeclAgreed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-primary/30 ml-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Signature (Full Name) <span className="text-destructive">*</span></Label>
                    <input value={empDeclName} onChange={e => { setEmpDeclName(e.target.value.toUpperCase()); clearError("empDeclName"); }} placeholder="Enter full name" className={cn("w-full h-12 px-4 text-sm bg-card border rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary hover:shadow-md hover:border-primary hover:bg-primary/5", errors.empDeclName ? "border-destructive" : "border-border")} />
                    {errors.empDeclName && <p className="text-sm text-destructive mt-1">{errors.empDeclName}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date <span className="text-destructive">*</span></Label>
                    <DatePickerField value={empDeclDate} onChange={d => { setEmpDeclDate(d); clearError("empDeclDate"); }} placeholder="Select date" />
                    {errors.empDeclDate && <p className="text-sm text-destructive mt-1">{errors.empDeclDate}</p>}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Reporting Officer Declaration */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Declaration by Reporting Officer</h4>
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground leading-relaxed">
                  I have verified the details filled up by the employee with the service records available in this office and have found that the details are true and correct to the best of my knowledge and belief. I am aware that if false declaration is made or false information is provided, I shall be liable for disciplinary action attracting major penalty as per the provisions of the <span className="font-semibold">Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Switch checked={officerDeclAgreed} onCheckedChange={setOfficerDeclAgreed} id="officerDeclAgreed" />
                <Label htmlFor="officerDeclAgreed" className="text-sm font-medium cursor-pointer">I agree to the above declaration</Label>
              </div>
              {errors.officerDeclAgreed && <p className="text-sm text-destructive mb-3">{errors.officerDeclAgreed}</p>}
              {officerDeclAgreed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-primary/30 ml-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Signature (Full Name) <span className="text-destructive">*</span></Label>
                    <input value={officerDeclName} onChange={e => { setOfficerDeclName(e.target.value.toUpperCase()); clearError("officerDeclName"); }} placeholder="Enter full name" className={cn("w-full h-12 px-4 text-sm bg-card border rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary hover:shadow-md hover:border-primary hover:bg-primary/5", errors.officerDeclName ? "border-destructive" : "border-border")} />
                    {errors.officerDeclName && <p className="text-sm text-destructive mt-1">{errors.officerDeclName}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date <span className="text-destructive">*</span></Label>
                    <DatePickerField value={officerDeclDate} onChange={d => { setOfficerDeclDate(d); clearError("officerDeclDate"); }} placeholder="Select date" />
                    {errors.officerDeclDate && <p className="text-sm text-destructive mt-1">{errors.officerDeclDate}</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pb-8">
            <button type="button" onClick={() => { setFormStep("preview"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-ghost px-8 py-3">Back to Preview</button>
            <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
              <Save className="w-5 h-5" /> Submit Employee Details
            </button>
          </div>
          </div>
        </form>
      </main>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
};

export default EmployeeCreate;
