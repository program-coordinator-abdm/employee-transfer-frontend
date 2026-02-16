import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getEmployeeById } from "@/lib/employeeStorage";

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
  const emp = getEmployeeById(id || "");

  if (!emp) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Employee Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested employee record does not exist.</p>
            <button onClick={() => navigate("/employee-list")} className="btn-primary">Go to Employee List</button>
          </Card>
        </main>
      </div>
    );
  }

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
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{emp.designationGroup}</Badge>
          </div>

          {/* Basic Info */}
          <SectionHeading title="Basic Information" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Designation" value={emp.designation} />
            <Field label="Group" value={`${emp.designationGroup} — ${emp.designationSubGroup}`} />
            <Field label="Date of Entry into Service" value={fmt(emp.dateOfEntry)} />
            <Field label="Date of Birth" value={fmt(emp.dateOfBirth)} />
            <Field label="Gender" value={emp.gender} />
            <Field label="Probationary Period" value={emp.probationaryPeriod ? "Yes" : "No"} />
          </div>

          {/* Communication Address */}
          <SectionHeading title="Communication Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={emp.address} />
            <Field label="Pin Code" value={emp.pinCode} />
            <Field label="Email" value={emp.email} />
            <Field label="Phone Number" value={emp.phoneNumber} />
            {emp.telephoneNumber && <Field label="Telephone" value={emp.telephoneNumber} />}
          </div>

          {/* Current Working Details */}
          <SectionHeading title="Current Working Details" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Post Held" value={emp.currentPostHeld} />
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
                    <Field label="Post Held" value={ps.postHeld} />
                    <Field label="Group" value={`${ps.postGroup} — ${ps.postSubGroup}`} />
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

          {/* Special Conditions */}
          <SectionHeading title="Special Conditions" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Terminally Ill" value={
              emp.terminallyIll ? <span className="text-destructive font-medium">Yes {emp.terminallyIllDoc && `— ${emp.terminallyIllDoc}`}</span> : "No"
            } />
            <Field label="Physically Challenged (>40%)" value={
              emp.physicallyChallenged ? <span className="text-destructive font-medium">Yes {emp.physicallyChallengedDoc && `— ${emp.physicallyChallengedDoc}`}</span> : "No"
            } />
            <Field label="Widow" value={
              emp.widow ? <span className="text-destructive font-medium">Yes {emp.widowDoc && `— ${emp.widowDoc}`}</span> : "No"
            } />
            <Field label="Spouse a Govt Servant" value={emp.spouseGovtServant ? "Yes" : "No"} />
          </div>
        </Card>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default EmployeeView;
