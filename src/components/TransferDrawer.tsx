import React, { useState, useEffect, useMemo } from "react";
import { X, MapPin, Briefcase, Calendar, ChevronDown, Search, Check, Building2 } from "lucide-react";
import { Employee, KARNATAKA_CITIES } from "@/lib/constants";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TransferDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: (transfer: { toCity: string; toPosition: string; toHospitalName: string; effectiveFrom: Date }) => void;
  isLoading: boolean;
}

const TransferDrawer: React.FC<TransferDrawerProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  isLoading,
}) => {
  const [toCity, setToCity] = useState(employee.currentCity);
  const [toPosition, setToPosition] = useState(employee.currentPosition);
  const [toHospitalName, setToHospitalName] = useState(employee.currentHospitalName || "");
  const [effectiveFrom, setEffectiveFrom] = useState<Date>(new Date());
  const [citySearch, setCitySearch] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Reset form when employee changes
  useEffect(() => {
    setToCity(employee.currentCity);
    setToPosition(employee.currentPosition);
    setToHospitalName(employee.currentHospitalName || "");
    setEffectiveFrom(new Date());
    setCitySearch("");
  }, [employee]);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    return toCity !== employee.currentCity || toPosition !== employee.currentPosition || toHospitalName !== (employee.currentHospitalName || "");
  }, [toCity, toPosition, toHospitalName, employee.currentCity, employee.currentPosition, employee.currentHospitalName]);

  // Filter cities
  const filteredCities = useMemo(() => {
    const search = citySearch.toLowerCase();
    return KARNATAKA_CITIES.filter((city) =>
      city.toLowerCase().includes(search)
    );
  }, [citySearch]);

  const handleSave = () => {
    if (!hasChanges) return;
    onSave({ toCity, toPosition, toHospitalName, effectiveFrom });
  };

  const handleCancel = () => {
    setToCity(employee.currentCity);
    setToPosition(employee.currentPosition);
    setToHospitalName(employee.currentHospitalName || "");
    setEffectiveFrom(new Date());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface shadow-floating z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Transfer Employee</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {employee.name} ({employee.kgid})
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* From (Read-only) */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Current Assignment (From)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{employee.currentCity}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="font-medium text-foreground">{employee.currentPosition}</p>
                </div>
              </div>
            </div>
          </div>

          {/* To Location */}
          <div>
            <label className="input-label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Transfer To (Location)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="input-field flex items-center justify-between cursor-pointer"
              >
                <span>{toCity || "Select city..."}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-50 max-h-64 overflow-hidden animate-scale-in">
                  {/* Search */}
                  <div className="p-2 border-b border-border sticky top-0 bg-popover">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search cities..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border-none rounded-md focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* City list */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setToCity(city);
                            setIsCityDropdownOpen(false);
                            setCitySearch("");
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                            city === toCity ? "bg-primary/10 text-primary" : "text-foreground"
                          }`}
                        >
                          {city}
                          {city === toCity && <Check className="w-4 h-4" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        No cities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="input-helper">Select the destination city in Karnataka</p>
          </div>

          {/* To Hospital */}
          <div>
            <label htmlFor="toHospitalName" className="input-label flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent-foreground" />
              Transfer To (Hospital/Facility)
            </label>
            <input
              id="toHospitalName"
              type="text"
              value={toHospitalName}
              onChange={(e) => setToHospitalName(e.target.value)}
              className="input-field"
              placeholder="Enter hospital or facility name..."
            />
            <p className="input-helper">Enter the hospital or facility name at the destination</p>
          </div>

          {/* To Position */}
          <div>
            <label htmlFor="toPosition" className="input-label flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-secondary" />
              Transfer To (Position)
            </label>
            <input
              id="toPosition"
              type="text"
              value={toPosition}
              onChange={(e) => setToPosition(e.target.value)}
              className="input-field"
              placeholder="Enter new position..."
            />
            <p className="input-helper">Enter the new position/designation for the employee</p>
          </div>

          {/* Effective From Date */}
          <div>
            <label className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-foreground" />
              Effective From
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="input-field flex items-center justify-between cursor-pointer"
                >
                  <span>{format(effectiveFrom, "dd MMMM yyyy")}</span>
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-[60]" align="start">
                <CalendarComponent
                  mode="single"
                  selected={effectiveFrom}
                  onSelect={(date) => date && setEffectiveFrom(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="input-helper">The date when the transfer becomes effective</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || !toCity || !toPosition || !toHospitalName}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Transfer"
                )}
              </button>
            )}
          </div>
          {!hasChanges && (
            <p className="text-sm text-muted-foreground text-center mt-3">
              No changes to save. Modify location or position to enable save.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default TransferDrawer;
