import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DatePickerField from "@/components/DatePickerField";
import PositionDropdown from "@/components/PositionDropdown";
import Toast, { useToastState } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { KARNATAKA_DISTRICTS } from "@/lib/positions";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import {
  type TransferFormData,
  EMPTY_TRANSFER_FORM,
  getTransferById,
  createTransferDraft,
  updateTransfer,
  submitTransferFinal,
} from "@/lib/transfersApi";
import { formatDateOnly } from "@/lib/dateUtils";

interface FormErrors {
  [key: string]: string;
}

const TransferCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit") || undefined;
  const isEditMode = !!editId;
  const { toast, showToast, hideToast } = useToastState();

  const [formData, setFormData] = useState<TransferFormData>(EMPTY_TRANSFER_FORM());
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<"fill" | "preview">("fill");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(editId || null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [recordStatus, setRecordStatus] = useState<"draft" | "submitted" | null>(null);
  const isReadOnly = recordStatus === "submitted";

  useEffect(() => {
    if (editId) {
      setLoadingRecord(true);
      getTransferById(editId)
        .then((rec) => {
          setFormData(rec.formData);
          setRecordId(rec.id);
          setRecordStatus(rec.status);
          if (rec.status === "submitted") setStep("preview");
        })
        .catch((err) => showToast(err.message || "Failed to load transfer", "error"))
        .finally(() => setLoadingRecord(false));
    }
  }, [editId]);

  const updateField = <K extends keyof TransferFormData>(key: K, value: TransferFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  // Validation — minimal and practical
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.kgid.trim()) e.kgid = "KGID is required";
    if (!formData.employeeName.trim()) e.employeeName = "Employee Name is required";
    if (!formData.currentDistrict) e.currentDistrict = "Current District is required";
    if (!formData.designation.trim()) e.designation = "Designation is required";
    return e;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (recordId) {
        await updateTransfer(recordId, formData);
      } else {
        const rec = await createTransferDraft(formData);
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
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      showToast("Please fill all required fields before previewing", "error");
      return;
    }
    setStep("preview");
    window.scrollTo(0, 0);
  };

  const handleSubmitFinal = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setStep("fill");
      showToast("Please complete all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      let id = recordId;
      if (id) {
        await updateTransfer(id, formData);
      } else {
        const rec = await createTransferDraft(formData);
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
  };

  // Shared styles
  const inputClass = "input-field h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary w-full px-3";
  const selectClass = inputClass;
  const labelClass = "input-label text-xs font-semibold text-foreground mb-1 block";
  const errorClass = "text-xs text-destructive mt-1";

  // ====== LOADING STATE ======
  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading transfer details...</p>
          </div>
        </main>
      </div>
    );
  }

  // ====== PREVIEW MODE ======
  if (step === "preview") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {isReadOnly ? "Transfer Application — View" : "Transfer Application — Preview"}
            </h1>
            {!isReadOnly && (
              <Button variant="outline" className="gap-1.5" onClick={() => { setStep("fill"); window.scrollTo(0, 0); }}>
                <ArrowLeft className="w-4 h-4" /> Edit
              </Button>
            )}
            {isReadOnly && (
              <Button variant="outline" className="gap-1.5" onClick={() => navigate("/transfers")}>
                <ArrowLeft className="w-4 h-4" /> Back to List
              </Button>
            )}
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Employee & Service Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <PreviewField label="Sl. No" value={formData.slNo} />
                <PreviewField label="Category Sl. No." value={formData.categorySlNo} />
                <PreviewField label="KGID" value={formData.kgid} />
                <PreviewField label="Employee Name" value={formData.employeeName} />
                <PreviewField label="Date of Birth" value={formData.dateOfBirth ? formatDateOnly(formData.dateOfBirth) : ""} />
                <PreviewField label="Date of Entry into Service" value={formData.dateOfEntryIntoService ? formatDateOnly(formData.dateOfEntryIntoService) : ""} />
                <PreviewField label="Current District" value={formData.currentDistrict} />
                <PreviewField label="Present Place of Working" value={formData.presentPlaceOfWorking} />
                <PreviewField label="Designation" value={formData.designation} />
                <PreviewField label="Specialization" value={formData.specialization} />
                <PreviewField label="Category Name" value={formData.categoryName} />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Zone-wise Years & Marks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm">
                <PreviewField label="GBA Years" value={formData.gbaYears} />
                <PreviewField label="GBA Marks" value={formData.gbaMarks} />
                <PreviewField label="A Years" value={formData.aYears} />
                <PreviewField label="A Marks" value={formData.aMarks} />
                <PreviewField label="B Years" value={formData.bYears} />
                <PreviewField label="B Marks" value={formData.bMarks} />
                <PreviewField label="C Years" value={formData.cYears} />
                <PreviewField label="C Marks" value={formData.cMarks} />
                <PreviewField label="Total Years" value={formData.totalYears} />
                <PreviewField label="Total Marks" value={formData.totalMarks} />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Remarks</h3>
              <p className="text-foreground">{formData.remarks || "—"}</p>
            </div>
          </Card>

          {isReadOnly ? (
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate("/transfers")} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back to List
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setStep("fill"); window.scrollTo(0, 0); }} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Edit
              </Button>
              <Button onClick={handleSubmitFinal} disabled={submitting} className="btn-primary gap-1.5">
                <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Final"}
              </Button>
            </div>
          )}
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
            <p className="text-sm text-muted-foreground">Fill in employee transfer details</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Employee & Service Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Employee & Service Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sl. No</label>
                <input className={inputClass} placeholder="Serial number" value={formData.slNo} onChange={(e) => updateField("slNo", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Category Sl. No.</label>
                <input className={inputClass} placeholder="Category serial number" value={formData.categorySlNo} onChange={(e) => updateField("categorySlNo", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>KGID <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.kgid && "border-destructive")} placeholder="Enter KGID" value={formData.kgid} onChange={(e) => updateField("kgid", e.target.value)} />
                {errors.kgid && <p className={errorClass}>{errors.kgid}</p>}
              </div>
              <div>
                <label className={labelClass}>Employee Name <span className="text-destructive">*</span></label>
                <input className={cn(inputClass, errors.employeeName && "border-destructive")} placeholder="Full name" value={formData.employeeName} onChange={(e) => updateField("employeeName", e.target.value.toUpperCase())} />
                {errors.employeeName && <p className={errorClass}>{errors.employeeName}</p>}
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <DatePickerField value={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : undefined} onChange={(d) => updateField("dateOfBirth", d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "")} placeholder="Select DOB" />
              </div>
              <div>
                <label className={labelClass}>Date of Entry into Service</label>
                <DatePickerField value={formData.dateOfEntryIntoService ? new Date(formData.dateOfEntryIntoService + "T00:00:00") : undefined} onChange={(d) => updateField("dateOfEntryIntoService", d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "")} placeholder="Select date" />
              </div>
              <div>
                <label className={labelClass}>Current District <span className="text-destructive">*</span></label>
                <select className={cn(selectClass, errors.currentDistrict && "border-destructive")} value={formData.currentDistrict} onChange={(e) => updateField("currentDistrict", e.target.value)}>
                  <option value="">Select District</option>
                  {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d.replace(/\s*\(.*?\)\s*$/, "")}</option>)}
                </select>
                {errors.currentDistrict && <p className={errorClass}>{errors.currentDistrict}</p>}
              </div>
              <div>
                <label className={labelClass}>Present Place of Working</label>
                <input className={inputClass} placeholder="Enter place" value={formData.presentPlaceOfWorking} onChange={(e) => updateField("presentPlaceOfWorking", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Designation <span className="text-destructive">*</span></label>
                <PositionDropdown
                  value={formData.designation}
                  onChange={(pos) => {
                    if (pos) handleDesignationSelect(pos);
                    else updateField("designation", "");
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
                <label className={labelClass}>Category Name</label>
                <input className={inputClass} placeholder="Category name" value={formData.categoryName} onChange={(e) => updateField("categoryName", e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Zone-wise Years & Marks */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Zone-wise Years & Marks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>GBA Years</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.gbaYears} onChange={(e) => updateField("gbaYears", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>GBA Marks</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.gbaMarks} onChange={(e) => updateField("gbaMarks", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>A Years</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.aYears} onChange={(e) => updateField("aYears", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>A Marks</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.aMarks} onChange={(e) => updateField("aMarks", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>B Years</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.bYears} onChange={(e) => updateField("bYears", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>B Marks</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.bMarks} onChange={(e) => updateField("bMarks", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>C Years</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.cYears} onChange={(e) => updateField("cYears", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>C Marks</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.cMarks} onChange={(e) => updateField("cMarks", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Total Years</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.totalYears} onChange={(e) => updateField("totalYears", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Total Marks</label>
                <input type="number" className={inputClass} placeholder="0" value={formData.totalMarks} onChange={(e) => updateField("totalMarks", e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Remarks */}
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
    <p className="text-foreground">{value || "—"}</p>
  </div>
);

export default TransferCreate;
