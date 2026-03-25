import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORY_ROLE_MAP } from "@/lib/constants";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DatePickerField from "@/components/DatePickerField";
import FileUploadField from "@/components/FileUploadField";
import PositionDropdown from "@/components/PositionDropdown";
import Toast, { useToastState } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { KARNATAKA_DISTRICTS } from "@/lib/positions";
import { getTaluks, getCities } from "@/lib/karnatakaGeo";
import { ArrowLeft, Plus, Trash2, Eye, Save, Send } from "lucide-react";
import { format } from "date-fns";
import {
  type TransferFormData,
  type TransferWorkDetail,
  EMPTY_WORK_DETAIL,
  EMPTY_TRANSFER_FORM,
  getTransferById,
  createTransferDraft,
  updateTransfer,
  submitTransferFinal,
  uploadTransferDocument,
} from "@/lib/transfersApi";

const ZONES = ["GBA", "A", "B", "C"];
const GROUPS = ["A", "B", "C", "D"];
const GENDERS = ["Male", "Female"];

const ALL_ROLES: string[] = Array.from(
  new Set(Object.values(CATEGORY_ROLE_MAP).flat())
).sort();

interface FormErrors {
  [key: string]: string;
}

const TransferCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = !!editId;
  const { toast, showToast, hideToast } = useToastState();

  const [formData, setFormData] = useState<TransferFormData>(EMPTY_TRANSFER_FORM());
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<"fill" | "preview">("fill");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(editId || null);
  const [roleOther, setRoleOther] = useState(false);

  // Pending file objects for upload on save
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    if (editId) {
      getTransferById(editId)
        .then((rec) => {
          setFormData(rec.formData);
          setRecordId(rec.id);
        })
        .catch((err) => showToast(err.message || "Failed to load transfer", "error"));
    }
  }, [editId]);

  // Field updaters
  const updateField = <K extends keyof TransferFormData>(key: K, value: TransferFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const updateWorkDetail = (idx: number, key: keyof TransferWorkDetail, value: string) => {
    setFormData((prev) => {
      const wd = [...prev.workDetails];
      wd[idx] = { ...wd[idx], [key]: value };
      if (key === "district") { wd[idx].taluka = ""; wd[idx].cityVillageTown = ""; }
      if (key === "taluka") { wd[idx].cityVillageTown = ""; }
      return { ...prev, workDetails: wd };
    });
    setErrors((prev) => { const n = { ...prev }; delete n[`workDetails.${idx}.${key}`]; return n; });
  };

  const addWorkDetail = () => {
    setFormData((prev) => ({ ...prev, workDetails: [...prev.workDetails, EMPTY_WORK_DETAIL()] }));
  };

  const removeWorkDetail = (idx: number) => {
    if (formData.workDetails.length <= 1) return;
    setFormData((prev) => ({ ...prev, workDetails: prev.workDetails.filter((_, i) => i !== idx) }));
  };

  const handleFileSelect = (fieldKey: string, fileName: string, file?: File) => {
    if (file) {
      setPendingFiles((prev) => ({ ...prev, [fieldKey]: file }));
    }
    updateField(fieldKey as keyof TransferFormData, fileName as any);
  };

  const uploadPendingFiles = async (): Promise<TransferFormData> => {
    let updatedData = { ...formData };
    for (const [key, file] of Object.entries(pendingFiles)) {
      try {
        const res = await uploadTransferDocument(file);
        (updatedData as any)[key] = res.url || res.fileName;
      } catch (err: any) {
        showToast(`Failed to upload ${file.name}: ${err.message}`, "error");
      }
    }
    setPendingFiles({});
    return updatedData;
  };

  // Validation
  const validate = (forSubmit: boolean): FormErrors => {
    const e: FormErrors = {};
    if (!formData.kgidNumber.trim()) e.kgidNumber = "KGID Number is required";
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.gender) e.gender = "Gender is required";
    if (!formData.dateOfBirth) e.dateOfBirth = "Date of Birth is required";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.pinCode.trim()) e.pinCode = "Pin Code is required";
    if (!formData.mailId.trim()) e.mailId = "Mail ID is required";
    if (!formData.mobileNumber.trim()) e.mobileNumber = "Mobile Number is required";
    if (!formData.group) e.group = "Group is required";
    if (!formData.designation) e.designation = "Designation is required";
    if (!formData.dateOfEntryIntoService) e.dateOfEntryIntoService = "Date of entry is required";
    if (!formData.probationaryPeriodDeclared) e.probationaryPeriodDeclared = "This field is required";

    formData.workDetails.forEach((wd, idx) => {
      if (!wd.postHeld) e[`workDetails.${idx}.postHeld`] = "Post held is required";
      if (!wd.instituteName) e[`workDetails.${idx}.instituteName`] = "Institute name is required";
      if (!wd.district) e[`workDetails.${idx}.district`] = "District is required";
      if (!wd.zone) e[`workDetails.${idx}.zone`] = "Zone is required";
      if (!wd.workingSince) e[`workDetails.${idx}.workingSince`] = "Working since is required";
    });

    // Document uploads are optional — no validation enforced

    return e;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const dataToSave = await uploadPendingFiles();
      if (recordId) {
        await updateTransfer(recordId, dataToSave);
      } else {
        const rec = await createTransferDraft(dataToSave);
        setRecordId(rec.id);
      }
      showToast("Draft saved successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save draft", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const e = validate(false);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      showToast("Please fill all required fields before previewing", "error");
      return;
    }
    setStep("preview");
    window.scrollTo(0, 0);
  };

  const handleSubmitFinal = async () => {
    const e = validate(true);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setStep("fill");
      showToast("Please complete all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      const dataToSave = await uploadPendingFiles();
      let id = recordId;
      if (id) {
        await updateTransfer(id, dataToSave);
      } else {
        const rec = await createTransferDraft(dataToSave);
        id = rec.id;
        setRecordId(id);
      }
      await submitTransferFinal(id!);
      showToast("Transfer submitted successfully!", "success");
      setTimeout(() => navigate("/transfers"), 1500);
    } catch (err: any) {
      showToast(err.message || "Failed to submit transfer", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesignationSelect = (pos: { name: string; group: string; subGroup: string }) => {
    updateField("designation", pos.name);
    updateField("group", pos.group.replace("Group ", ""));
  };

  // Shared styles
  const inputClass = "input-field h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary w-full px-3";
  const selectClass = inputClass;
  const labelClass = "input-label text-xs font-semibold text-foreground mb-1 block";
  const errorClass = "text-xs text-destructive mt-1";

  // ====== PREVIEW MODE ======
  if (step === "preview") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Transfer Application — Preview</h1>
            <Button variant="outline" className="gap-1.5" onClick={() => { setStep("fill"); window.scrollTo(0, 0); }}>
              <ArrowLeft className="w-4 h-4" /> Edit
            </Button>
          </div>

          <Card className="p-6 space-y-6">
            {/* Section 1 */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">1. Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <PreviewField label="KGID Number" value={formData.kgidNumber} />
                <PreviewField label="Name" value={formData.name} />
                <PreviewField label="Gender" value={formData.gender} />
                <PreviewField label="Date of Birth" value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd MMM yyyy") : ""} />
                <PreviewField label="Address" value={formData.address} className="sm:col-span-2" />
                <PreviewField label="Pin Code" value={formData.pinCode} />
                <PreviewField label="Mail ID" value={formData.mailId} />
                <PreviewField label="Mobile Number" value={formData.mobileNumber} />
                <PreviewField label="Residence Number" value={formData.residenceNumber || "—"} />
              </div>
            </div>
            <Separator />
            {/* Section 2 */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">2. Current Service Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <PreviewField label="Group" value={formData.group} />
                <PreviewField label="Role" value={formData.role || "—"} />
                <PreviewField label="Designation" value={formData.designation} />
                <PreviewField label="Specialization" value={formData.specialization || "—"} />
                <PreviewField label="Date of Entry" value={formData.dateOfEntryIntoService ? format(new Date(formData.dateOfEntryIntoService), "dd MMM yyyy") : ""} />
                <PreviewField label="Probationary Period Declared" value={formData.probationaryPeriodDeclared} />
              </div>
            </div>
            <Separator />
            {/* Section 3 */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">3. Past Service Details</h3>
              {formData.workDetails.map((wd, idx) => (
                <div key={idx} className="mb-4 bg-muted/20 rounded-lg p-4">
                  <p className="font-medium text-foreground mb-2">Entry {idx + 1}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <PreviewField label="Post Held" value={wd.postHeld} />
                    <PreviewField label="Speciality" value={wd.speciality || "—"} />
                    <PreviewField label="Institute" value={wd.instituteName} />
                    <PreviewField label="District" value={wd.district} />
                    <PreviewField label="Taluka" value={wd.taluka || "—"} />
                    <PreviewField label="City/Village/Town" value={wd.cityVillageTown || "—"} />
                    <PreviewField label="Zone" value={wd.zone} />
                    <PreviewField label="Working Since" value={wd.workingSince ? format(new Date(wd.workingSince), "dd MMM yyyy") : ""} />
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            {/* Section 4 */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">4. Special Conditions</h3>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <PreviewField label="Officer/Spouse/Children suffering terminally ill" value={formData.terminallyIll ? "Yes" : "No"} />
                <PreviewField label="Physically Challenged with 40% or more" value={formData.physicallyChallenged ? "Yes" : "No"} />
                <PreviewField label="Widow/Widower/Divorcee having dependent children below 12 years" value={formData.widow ? "Yes" : "No"} />
                <PreviewField label="Spouse working in Central/State Government or Aided Institutions" value={formData.spouseInGovtService ? "Yes" : "No"} />
              </div>
            </div>
            <Separator />
            {/* Section 5: Elected Members */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">5. Karnataka State Govt Employee Association Elected Members</h3>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
              <PreviewField label="Elected Association Member" value={formData.ngoBenefits ? `Yes — ${formData.ngoBenefitsDoc || "Document pending"}` : "No"} />
              </div>
            </div>
            <Separator />
            {/* Remarks */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Remarks</h3>
              <p className="text-foreground">{formData.remarks || "—"}</p>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => { setStep("fill"); window.scrollTo(0, 0); }} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Edit
            </Button>
            <Button onClick={handleSubmitFinal} disabled={submitting} className="btn-primary gap-1.5">
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Final"}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ====== FORM MODE ======
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/transfers")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEditMode ? "Edit Transfer" : "New Transfer Application"}</h1>
            <p className="text-sm text-muted-foreground">Fill all sections to complete the transfer application</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* SECTION 1: Personal Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">1. Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>KGID Number <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.kgidNumber && "border-destructive")} placeholder="Enter KGID" value={formData.kgidNumber} onChange={(e) => updateField("kgidNumber", e.target.value)} />
                {errors.kgidNumber && <p className={errorClass}>{errors.kgidNumber}</p>}
              </div>
              <div>
                <label className={labelClass}>Name <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.name && "border-destructive")} placeholder="FULL NAME" value={formData.name} onChange={(e) => updateField("name", e.target.value.toUpperCase())} />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Gender <span className="text-destructive">*</span></label>
                <select className={cn(selectClass, errors.gender && "border-destructive")} value={formData.gender} onChange={(e) => updateField("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <p className={errorClass}>{errors.gender}</p>}
              </div>
              <div>
                <label className={labelClass}>Date of Birth <span className="text-destructive">*</span></label>
                <DatePickerField value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined} onChange={(d) => updateField("dateOfBirth", d ? d.toISOString() : "")} placeholder="Select DOB" />
                {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth}</p>}
              </div>
            </div>

            <h3 className="text-sm font-bold text-foreground mt-6 mb-3">Address for Communication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address <span className="text-destructive">*</span></label>
                <textarea className={cn(inputClass, "h-20 py-2", errors.address && "border-destructive")} placeholder="Enter full address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} />
                {errors.address && <p className={errorClass}>{errors.address}</p>}
              </div>
              <div>
                <label className={labelClass}>Pin Code <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.pinCode && "border-destructive")} placeholder="Enter pin code" value={formData.pinCode} onChange={(e) => updateField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                {errors.pinCode && <p className={errorClass}>{errors.pinCode}</p>}
              </div>
              <div>
                <label className={labelClass}>Mail ID <span className="text-destructive">*</span></label>
                <input type="email" className={cn(inputClass, errors.mailId && "border-destructive")} placeholder="example@mail.com" value={formData.mailId} onChange={(e) => updateField("mailId", e.target.value)} />
                {errors.mailId && <p className={errorClass}>{errors.mailId}</p>}
              </div>
              <div>
                <label className={labelClass}>Mobile Number <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.mobileNumber && "border-destructive")} placeholder="10-digit mobile number" value={formData.mobileNumber} onChange={(e) => updateField("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                {errors.mobileNumber && <p className={errorClass}>{errors.mobileNumber}</p>}
              </div>
              <div>
                <label className={labelClass}>Residence Number</label>
                <input className={inputClass} placeholder="Optional" value={formData.residenceNumber} onChange={(e) => updateField("residenceNumber", e.target.value)} />
              </div>
            </div>
          </Card>

          {/* SECTION 2: Current Service Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">2. Current Service Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Group <span className="text-destructive">*</span></label>
                <select className={cn(selectClass, errors.group && "border-destructive")} value={formData.group} onChange={(e) => updateField("group", e.target.value)}>
                  <option value="">Select Group</option>
                  {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.group && <p className={errorClass}>{errors.group}</p>}
              </div>
              <div>
                <label className={labelClass}>Role</label>
                {roleOther ? (
                  <div className="flex gap-2">
                    <input className={inputClass} placeholder="Enter role manually" value={formData.role} onChange={(e) => updateField("role", e.target.value)} autoFocus />
                    <Button type="button" variant="outline" size="sm" className="shrink-0 h-12" onClick={() => { setRoleOther(false); updateField("role", ""); }}>Back</Button>
                  </div>
                ) : (
                  <select className={selectClass} value={formData.role} onChange={(e) => { if (e.target.value === "__other__") { setRoleOther(true); updateField("role", ""); } else { updateField("role", e.target.value); } }}>
                    <option value="">Select Role (optional)</option>
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="__other__">Others (Enter manually)</option>
                  </select>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Designation <span className="text-destructive">*</span></label>
                <PositionDropdown
                  value={formData.designation}
                  onChange={(pos) => {
                    if (pos) handleDesignationSelect(pos);
                    else { updateField("designation", ""); updateField("group", ""); }
                  }}
                  placeholder="Search & select designation..."
                />
                {errors.designation && <p className={errorClass}>{errors.designation}</p>}
              </div>
              <div>
                <label className={labelClass}>Specialization</label>
                <input className={inputClass} placeholder="Optional" value={formData.specialization} onChange={(e) => updateField("specialization", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Date of Entry into Service <span className="text-destructive">*</span></label>
                <DatePickerField value={formData.dateOfEntryIntoService ? new Date(formData.dateOfEntryIntoService) : undefined} onChange={(d) => updateField("dateOfEntryIntoService", d ? d.toISOString() : "")} placeholder="Select date" />
                {errors.dateOfEntryIntoService && <p className={errorClass}>{errors.dateOfEntryIntoService}</p>}
              </div>
              <div>
                <label className={labelClass}>Probationary Period Declared <span className="text-destructive">*</span></label>
                <select className={cn(selectClass, errors.probationaryPeriodDeclared && "border-destructive")} value={formData.probationaryPeriodDeclared} onChange={(e) => updateField("probationaryPeriodDeclared", e.target.value)}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.probationaryPeriodDeclared && <p className={errorClass}>{errors.probationaryPeriodDeclared}</p>}
              </div>
            </div>
          </Card>

          {/* SECTION 3: Past Service Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">3. Past Service Details</h2>
            {formData.workDetails.map((wd, idx) => (
              <div key={idx} className="mb-6 bg-muted/10 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Post Detail {idx + 1}</p>
                  {formData.workDetails.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => removeWorkDetail(idx)}>
                      <Trash2 className="w-4 h-4" /> Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Post Held <span className="text-destructive">*</span></label>
                    <input className={cn(inputClass, errors[`workDetails.${idx}.postHeld`] && "border-destructive")} placeholder="Enter post" value={wd.postHeld} onChange={(e) => updateWorkDetail(idx, "postHeld", e.target.value)} />
                    {errors[`workDetails.${idx}.postHeld`] && <p className={errorClass}>{errors[`workDetails.${idx}.postHeld`]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Speciality</label>
                    <input className={inputClass} placeholder="Optional" value={wd.speciality} onChange={(e) => updateWorkDetail(idx, "speciality", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Name of Institute <span className="text-destructive">*</span></label>
                    <input className={cn(inputClass, errors[`workDetails.${idx}.instituteName`] && "border-destructive")} placeholder="Enter institute name" value={wd.instituteName} onChange={(e) => updateWorkDetail(idx, "instituteName", e.target.value)} />
                    {errors[`workDetails.${idx}.instituteName`] && <p className={errorClass}>{errors[`workDetails.${idx}.instituteName`]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>District <span className="text-destructive">*</span></label>
                    <select className={cn(selectClass, errors[`workDetails.${idx}.district`] && "border-destructive")} value={wd.district} onChange={(e) => updateWorkDetail(idx, "district", e.target.value)}>
                      <option value="">Select District</option>
                      {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d.replace(/\s*\(.*?\)\s*$/, "")}</option>)}
                    </select>
                    {errors[`workDetails.${idx}.district`] && <p className={errorClass}>{errors[`workDetails.${idx}.district`]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Taluka</label>
                    <select className={selectClass} value={wd.taluka} onChange={(e) => updateWorkDetail(idx, "taluka", e.target.value)} disabled={!wd.district}>
                      <option value="">Select Taluka</option>
                      {getTaluks(wd.district).map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>City/Village/Town</label>
                    <select className={selectClass} value={wd.cityVillageTown} onChange={(e) => updateWorkDetail(idx, "cityVillageTown", e.target.value)} disabled={!wd.taluka}>
                      <option value="">Select City/Village</option>
                      {getCities(wd.district, wd.taluka).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Zone <span className="text-destructive">*</span></label>
                    <select className={cn(selectClass, errors[`workDetails.${idx}.zone`] && "border-destructive")} value={wd.zone} onChange={(e) => updateWorkDetail(idx, "zone", e.target.value)}>
                      <option value="">Select Zone</option>
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                    {errors[`workDetails.${idx}.zone`] && <p className={errorClass}>{errors[`workDetails.${idx}.zone`]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Working in this post since <span className="text-destructive">*</span></label>
                    <DatePickerField
                      value={wd.workingSince ? new Date(wd.workingSince) : undefined}
                      onChange={(d) => updateWorkDetail(idx, "workingSince", d ? d.toISOString() : "")}
                      placeholder="Select date"
                    />
                    {errors[`workDetails.${idx}.workingSince`] && <p className={errorClass}>{errors[`workDetails.${idx}.workingSince`]}</p>}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addWorkDetail} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4" /> Add More Post Details
            </Button>
          </Card>

          {/* SECTION 4: Special Conditions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">4. Special Conditions</h2>
            <div className="space-y-5">
              {([
                { key: "terminallyIll", docKey: "terminallyIllDoc", label: "Officer/Spouse/Children suffering terminally ill which needs treatment outside present working place", docLabel: "Upload Medical Certificate" },
                { key: "physicallyChallenged", docKey: "physicallyChallengedDoc", label: "Physically Challenged with 40% or more (Officer/Spouse/Children)", docLabel: "Upload Disability Certificate" },
                { key: "widow", docKey: "widowDoc", label: "Widow/Widower/Divorcee having dependent children below 12 years of age", docLabel: "Upload Supporting Document" },
                { key: "spouseInGovtService", docKey: "spouseInGovtServiceDoc", label: "Spouse working in Central/State Government or Aided Institutions", docLabel: "Certificate issued by Department / Head of Office" },
              ] as const).map(({ key, docKey, label, docLabel }) => (
                <div key={key} className="bg-muted/10 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <label className={labelClass + " mb-0"}>{label}</label>
                    <select className="h-9 px-3 text-sm border border-border rounded-lg bg-card" value={(formData as any)[key] ? "Yes" : "No"} onChange={(e) => updateField(key, e.target.value === "Yes")}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  {(formData as any)[key] && (
                    <div className="mt-3">
                      <FileUploadField
                        value={(formData as any)[docKey]}
                        onChange={(fileName, file) => handleFileSelect(docKey, fileName, file)}
                        label={docLabel}
                        required={false}
                        error={errors[docKey]}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 5: Elected Members */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">5. Karnataka State Government Employee Association Elected Members</h2>
            <p className="text-sm text-muted-foreground mb-5">Details related to elected Karnataka State Government Employee Association membership</p>
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium leading-snug">Are you an elected Karnataka State Government Employee Association member?</Label>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={formData.ngoBenefits} onCheckedChange={(v) => updateField("ngoBenefits", v)} />
                  <span className="text-sm text-muted-foreground w-8">{formData.ngoBenefits ? "Yes" : "No"}</span>
                </div>
              </div>
              {formData.ngoBenefits && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ಚುನಾವಣಾ ಅಧಿಕಾರಿಯ ದೃಢೀಕೃತ ಪ್ರಮಾಣಪತ್ರ — Duly certified by the Election Officer</p>
                  <FileUploadField
                    value={formData.ngoBenefitsDoc}
                    onChange={(fileName, file) => handleFileSelect("ngoBenefitsDoc", fileName, file)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                    error={errors.ngoBenefitsDoc}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* REMARKS */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Remarks</h2>
            <div>
              <label className={labelClass}>Remarks (Optional)</label>
              <textarea
                className={cn(inputClass, "h-24 py-2")}
                placeholder="Enter any additional remarks (optional)"
                value={formData.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-1.5">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="outline" onClick={handlePreview} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button onClick={handleSubmitFinal} disabled={submitting} className="btn-primary gap-1.5">
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Final"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper component for preview
const PreviewField: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-sm font-medium text-primary mb-0.5">{label}</p>
    <p className="text-foreground">{value || "Not provided"}</p>
  </div>
);

export default TransferCreate;
