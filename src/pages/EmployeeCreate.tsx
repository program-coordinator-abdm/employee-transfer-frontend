import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react";
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
import { saveEmployee, type NewEmployee, type PastServiceEntry } from "@/lib/employeeStorage";
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
  const { toast, showToast, hideToast } = useToastState();
  const [errors, setErrors] = useState<FormErrors>({});

  // Basic fields
  const [kgid, setKgid] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designationGroup, setDesignationGroup] = useState("");
  const [designationSubGroup, setDesignationSubGroup] = useState("");
  const [dateOfEntry, setDateOfEntry] = useState<Date>();
  const [gender, setGender] = useState("");
  const [probationaryPeriod, setProbationaryPeriod] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

  // Address
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");

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
  const [physicallyChallenged, setPhysicallyChallenged] = useState(false);
  const [physicallyChallengedDoc, setPhysicallyChallengedDoc] = useState("");
  const [widow, setWidow] = useState(false);
  const [widowDoc, setWidowDoc] = useState("");
  const [spouseGovtServant, setSpouseGovtServant] = useState(false);
  const [pregnantOrChildUnderOne, setPregnantOrChildUnderOne] = useState(false);
  const [pregnantOrChildUnderOneDoc, setPregnantOrChildUnderOneDoc] = useState("");
  const [retiringWithinTwoYears, setRetiringWithinTwoYears] = useState(false);
  const [retiringWithinTwoYearsDoc, setRetiringWithinTwoYearsDoc] = useState("");
  const [childSpouseDisability, setChildSpouseDisability] = useState(false);
  const [childSpouseDisabilityDoc, setChildSpouseDisabilityDoc] = useState("");
  const [divorceeWidowWithChild, setDivorceeWidowWithChild] = useState(false);
  const [divorceeWidowWithChildDoc, setDivorceeWidowWithChildDoc] = useState("");

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

  const validate = (): boolean => {
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
    if (!currentPostHeld) errs.currentPostHeld = "Current post is required";
    if (!currentInstitution.trim()) errs.currentInstitution = "Institution is required";
    if (!currentDistrict) errs.currentDistrict = "District is required";
    if (!currentTaluk.trim()) errs.currentTaluk = "Taluk is required";
    if (!currentCityTownVillage.trim()) errs.currentCityTownVillage = "City/Town/Village is required";
    if (!currentWorkingSince) errs.currentWorkingSince = "Working since date is required";
    if (terminallyIll && !terminallyIllDoc) errs.terminallyIllDoc = "Certificate is required";
    if (physicallyChallenged && !physicallyChallengedDoc) errs.physicallyChallengedDoc = "Certificate is required";
    if (widow && !widowDoc) errs.widowDoc = "Documentary proof is required";
    if (pregnantOrChildUnderOne && !pregnantOrChildUnderOneDoc) errs.pregnantOrChildUnderOneDoc = "Documentary proof is required";
    if (retiringWithinTwoYears && !retiringWithinTwoYearsDoc) errs.retiringWithinTwoYearsDoc = "Documentary proof is required";
    if (childSpouseDisability && !childSpouseDisabilityDoc) errs.childSpouseDisabilityDoc = "Certificate is required";
    if (divorceeWidowWithChild && !divorceeWidowWithChildDoc) errs.divorceeWidowWithChildDoc = "Documentary proof is required";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const emp: NewEmployee = {
      id: Date.now().toString(),
      kgid, name, designation, designationGroup, designationSubGroup,
      dateOfEntry: dateOfEntry!.toISOString(),
      gender, probationaryPeriod,
      dateOfBirth: dateOfBirth!.toISOString(),
      address, pinCode, email, phoneNumber, telephoneNumber,
      currentPostHeld, currentPostGroup, currentPostSubGroup,
      currentInstitution, currentDistrict, currentTaluk, currentCityTownVillage,
      currentWorkingSince: currentWorkingSince!.toISOString(),
      pastServices, terminallyIll, terminallyIllDoc,
      physicallyChallenged, physicallyChallengedDoc,
      widow, widowDoc, spouseGovtServant,
      pregnantOrChildUnderOne, pregnantOrChildUnderOneDoc,
      retiringWithinTwoYears, retiringWithinTwoYearsDoc,
      childSpouseDisability, childSpouseDisabilityDoc,
      divorceeWidowWithChild, divorceeWidowWithChildDoc,
      createdAt: new Date().toISOString(),
    };
    saveEmployee(emp);
    showToast("Employee created successfully!", "success");
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/categories")} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Employee</h1>
            <p className="text-sm text-muted-foreground">Fill in all required details to register an employee</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. KGID & Name */}
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
                <input value={name} onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z\s.]/g, ""); setName(v); clearError("name"); }} className={`input-field ${errors.name ? "border-destructive" : ""}`} placeholder="Full name (alphabetic only)" />
                <FieldError error={errors.name} />
              </div>
            </div>
          </Card>

          {/* 2. Designation */}
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

          {/* 3. Service & Personal */}
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
                  {["Male", "Female", "Others"].map((g) => (
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
              <div className="flex items-center gap-4 pt-6">
                <Label htmlFor="probation" className="text-sm font-medium">Probationary Period</Label>
                <Switch id="probation" checked={probationaryPeriod} onCheckedChange={setProbationaryPeriod} />
                <span className="text-sm text-muted-foreground">{probationaryPeriod ? "Yes" : "No"}</span>
              </div>
            </div>
          </Card>

          {/* 4. Communication Address */}
          <Card className="p-6">
            <SectionTitle number="4" title="Communication Address" />
            <div className="space-y-4">
              <div>
                <label className="input-label">Address <span className="text-destructive">*</span></label>
                <textarea value={address} onChange={(e) => { setAddress(e.target.value); clearError("address"); }} className={`input-field min-h-[80px] resize-y ${errors.address ? "border-destructive" : ""}`} placeholder="Full address for communication" />
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
          </Card>

          {/* 5. Current Working Details */}
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

          {/* 6. Past Service Details */}
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

          {/* 7. Special Conditions */}
          <Card className="p-6">
            <SectionTitle number="7" title="Special Conditions" />
            <div className="space-y-5">
              {/* Terminally Ill */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Terminally ill case of serious ailment</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={terminallyIll} onCheckedChange={setTerminallyIll} />
                    <span className="text-sm text-muted-foreground w-8">{terminallyIll ? "Yes" : "No"}</span>
                  </div>
                </div>
                {terminallyIll && (
                  <div>
                    <label className="input-label text-xs">Attach Certificate issued by District Medical Board <span className="text-destructive">*</span></label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setTerminallyIllDoc(e.target.files?.[0]?.name || ""); clearError("terminallyIllDoc"); }} />
                        <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.terminallyIllDoc && "border-destructive")}>
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className={cn("text-sm", terminallyIllDoc ? "text-foreground" : "text-muted-foreground")}>
                            {terminallyIllDoc || "Choose PDF file..."}
                          </span>
                        </div>
                      </label>
                    </div>
                    <FieldError error={errors.terminallyIllDoc} />
                  </div>
                )}
              </div>

              {/* Physically Challenged */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Physically Challenged (if more than 40% only)</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={physicallyChallenged} onCheckedChange={setPhysicallyChallenged} />
                    <span className="text-sm text-muted-foreground w-8">{physicallyChallenged ? "Yes" : "No"}</span>
                  </div>
                </div>
                {physicallyChallenged && (
                  <div>
                    <label className="input-label text-xs">Attach Certificate issued by District Medical Board <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setPhysicallyChallengedDoc(e.target.files?.[0]?.name || ""); clearError("physicallyChallengedDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.physicallyChallengedDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", physicallyChallengedDoc ? "text-foreground" : "text-muted-foreground")}>
                          {physicallyChallengedDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.physicallyChallengedDoc} />
                  </div>
                )}
              </div>

              {/* Widow/Widower */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Widow/Widower</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={widow} onCheckedChange={setWidow} />
                    <span className="text-sm text-muted-foreground w-8">{widow ? "Yes" : "No"}</span>
                  </div>
                </div>
                {widow && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setWidowDoc(e.target.files?.[0]?.name || ""); clearError("widowDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.widowDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", widowDoc ? "text-foreground" : "text-muted-foreground")}>
                          {widowDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.widowDoc} />
                  </div>
                )}
              </div>

              {/* Divorcee/Widow/Widower with child ≤12 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Divorcee / Widow / Widower with child 12 or less years of age</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={divorceeWidowWithChild} onCheckedChange={setDivorceeWidowWithChild} />
                    <span className="text-sm text-muted-foreground w-8">{divorceeWidowWithChild ? "Yes" : "No"}</span>
                  </div>
                </div>
                {divorceeWidowWithChild && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setDivorceeWidowWithChildDoc(e.target.files?.[0]?.name || ""); clearError("divorceeWidowWithChildDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.divorceeWidowWithChildDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", divorceeWidowWithChildDoc ? "text-foreground" : "text-muted-foreground")}>
                          {divorceeWidowWithChildDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.divorceeWidowWithChildDoc} />
                  </div>
                )}
              </div>

              {/* Pregnant / Child under 1 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pregnant woman / Staff with child less than one year of age</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={pregnantOrChildUnderOne} onCheckedChange={setPregnantOrChildUnderOne} />
                    <span className="text-sm text-muted-foreground w-8">{pregnantOrChildUnderOne ? "Yes" : "No"}</span>
                  </div>
                </div>
                {pregnantOrChildUnderOne && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setPregnantOrChildUnderOneDoc(e.target.files?.[0]?.name || ""); clearError("pregnantOrChildUnderOneDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.pregnantOrChildUnderOneDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", pregnantOrChildUnderOneDoc ? "text-foreground" : "text-muted-foreground")}>
                          {pregnantOrChildUnderOneDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.pregnantOrChildUnderOneDoc} />
                  </div>
                )}
              </div>

              {/* Retiring within 2 years */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Medical officer / Staff due to retire on superannuation within two years</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={retiringWithinTwoYears} onCheckedChange={setRetiringWithinTwoYears} />
                    <span className="text-sm text-muted-foreground w-8">{retiringWithinTwoYears ? "Yes" : "No"}</span>
                  </div>
                </div>
                {retiringWithinTwoYears && (
                  <div>
                    <label className="input-label text-xs">Attach Documentary Proof <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setRetiringWithinTwoYearsDoc(e.target.files?.[0]?.name || ""); clearError("retiringWithinTwoYearsDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.retiringWithinTwoYearsDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", retiringWithinTwoYearsDoc ? "text-foreground" : "text-muted-foreground")}>
                          {retiringWithinTwoYearsDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.retiringWithinTwoYearsDoc} />
                  </div>
                )}
              </div>

              {/* Child/Spouse with 40%+ disability */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Staff with child / spouse with 40% or more disability</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={childSpouseDisability} onCheckedChange={setChildSpouseDisability} />
                    <span className="text-sm text-muted-foreground w-8">{childSpouseDisability ? "Yes" : "No"}</span>
                  </div>
                </div>
                {childSpouseDisability && (
                  <div>
                    <label className="input-label text-xs">Attach Certificate issued by District Medical Board <span className="text-destructive">*</span></label>
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { setChildSpouseDisabilityDoc(e.target.files?.[0]?.name || ""); clearError("childSpouseDisabilityDoc"); }} />
                      <div className={cn("input-field flex items-center gap-2 cursor-pointer", errors.childSpouseDisabilityDoc && "border-destructive")}>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className={cn("text-sm", childSpouseDisabilityDoc ? "text-foreground" : "text-muted-foreground")}>
                          {childSpouseDisabilityDoc || "Choose PDF file..."}
                        </span>
                      </div>
                    </label>
                    <FieldError error={errors.childSpouseDisabilityDoc} />
                  </div>
                )}
              </div>

              {/* Spouse */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                <Label className="text-sm font-medium">Is spouse a government servant?</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={spouseGovtServant} onCheckedChange={setSpouseGovtServant} />
                  <span className="text-sm text-muted-foreground w-8">{spouseGovtServant ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button type="button" onClick={() => navigate("/categories")} className="btn-ghost px-8 py-3">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
              <Save className="w-5 h-5" /> Submit Employee Details
            </button>
          </div>
        </form>
      </main>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
};

export default EmployeeCreate;
