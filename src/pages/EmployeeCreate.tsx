import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Toast, { useToastState } from "@/components/Toast";

interface FormData {
  name: string;
  kgid: string;
  education: string;
  experience: string;
  roles: string;
  placesOfWork: string;
}

const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToastState();

  const [form, setForm] = useState<FormData>({
    name: "",
    kgid: "",
    education: "",
    experience: "",
    roles: "",
    placesOfWork: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Employee Name is required";
    if (!form.kgid.trim()) errs.kgid = "KGID Number is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Temporary save
    const existing = JSON.parse(localStorage.getItem("do_employees") || "[]");
    existing.push({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString() });
    localStorage.setItem("do_employees", JSON.stringify(existing));
    console.log("Employee saved:", form);

    showToast("Employee created successfully!", "success");
    setTimeout(() => navigate("/data-officer"), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/data-officer")} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-lg font-bold text-foreground">Add New Employee</h1>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-floating border border-border/50 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="input-label">Employee Name <span className="text-danger">*</span></label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={`input-field ${errors.name ? "border-danger" : ""}`} placeholder="Full name" />
              {errors.name && <p className="input-error">{errors.name}</p>}
            </div>

            {/* KGID */}
            <div>
              <label htmlFor="kgid" className="input-label">KGID Number <span className="text-danger">*</span></label>
              <input id="kgid" name="kgid" value={form.kgid} onChange={handleChange} className={`input-field ${errors.kgid ? "border-danger" : ""}`} placeholder="e.g. 123456" />
              {errors.kgid && <p className="input-error">{errors.kgid}</p>}
            </div>

            {/* Education */}
            <div>
              <label htmlFor="education" className="input-label">Education</label>
              <input id="education" name="education" value={form.education} onChange={handleChange} className="input-field" placeholder="Qualification" />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="input-label">Experience (years)</label>
              <input id="experience" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} className="input-field" placeholder="e.g. 5" />
            </div>

            {/* Roles */}
            <div>
              <label htmlFor="roles" className="input-label">Roles</label>
              <input id="roles" name="roles" value={form.roles} onChange={handleChange} className="input-field" placeholder="Comma-separated" />
            </div>

            {/* Places of Work */}
            <div>
              <label htmlFor="placesOfWork" className="input-label">Places of Work</label>
              <input id="placesOfWork" name="placesOfWork" value={form.placesOfWork} onChange={handleChange} className="input-field" placeholder="Comma-separated" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
            <button type="button" onClick={() => navigate("/data-officer")} className="btn-ghost px-6 py-2.5">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2 px-6 py-2.5">
              <Save className="w-4 h-4" /> Save Employee
            </button>
          </div>
        </form>
      </main>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
};

export default EmployeeCreate;
