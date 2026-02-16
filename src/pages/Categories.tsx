import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BarChart3, TrendingUp, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownGroupConfig {
  key: string;
  label: string;
  options: string[];
}

const LRO_POSITIONS: string[] = [
  "Chief Transport Officer",
  "Administrative Officer (AO) (General) / (Transport) / (Family Welfare)",
  "Administrative Officer (AO) (Medical) (DME)",
  "Chief Food Analyst",
  "Assistant Director of Pharmacy (Chief Pharmacist)",
  "Health Education Officer",
];

const JRO_LRO_POSITIONS: string[] = [
  "Nephrologist / Urologist",
  "Forensic Medicine",
  "Pathologist / Blood Bank",
  "Micro Biologist",
  "Bio Chemist",
  "Psychiatrist",
  "TB",
  "General Medicine",
  "General Surgeon + Burns Ward (5)",
  "Obstetrics and Gynaecologist (OBG)",
  "Pediatrician",
  "Anesthesiologist + (Medical Intensivist-3)",
  "Ophthalmologist",
  "Orthopedician",
  "Ear, Nose and Throat Specialist / Otorhinolaryngology",
  "Skin Specialist / Dermatologist + LEP-2",
  "Radiologist",
  "Other (Public Health Manager, Epidemiologist-2 MLCD-4)",
  "Cardiologist / Neurosurgeon / Plastic Surgeon / General Duty Medical Officers / SMO / DCMO / CMO / Dental Health Officers",
];

const SUB_OPTIONS: Record<string, string[]> = {
  "Group A Officers (LRO)": LRO_POSITIONS,
  "Group A Doctors (JRO & LRO)": JRO_LRO_POSITIONS,
};

const GROUP_CONFIGS: DropdownGroupConfig[] = [
  { key: "groupA", label: "Group A", options: ["Group A Officers (LRO)", "Group A Doctors (JRO & LRO)"] },
  { key: "groupB", label: "Group B", options: ["Group B Officers"] },
  { key: "groupC", label: "Group C", options: ["Group C Employees"] },
  { key: "groupD", label: "Group D", options: ["Group D Employees"] },
];

const SearchableDropdown: React.FC<{
  config: DropdownGroupConfig;
  value: string;
  onChange: (val: string) => void;
}> = ({ config, value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 hover:text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || `Select ${config.label}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border border-border shadow-lg rounded-lg">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {config.options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option === value ? "" : option);
                    setOpen(false);
                  }}
                  className="py-2.5 px-3 cursor-pointer font-medium tracking-wide data-[selected='true']:bg-teal-50 data-[selected='true']:text-teal-700"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const Categories: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [subSelections, setSubSelections] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSelectionChange = (groupKey: string, value: string) => {
    setSelections((prev) => ({ ...prev, [groupKey]: value }));
    setSubSelections((prev) => ({ ...prev, [groupKey]: "" }));
  };

  const handleSubSelectionChange = (groupKey: string, value: string) => {
    setSubSelections((prev) => ({ ...prev, [groupKey]: value }));
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Staff Categories</h1>
          <p className="text-muted-foreground">Select a category to view and manage employee transfers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
          {GROUP_CONFIGS.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">{group.label}</label>
              <SearchableDropdown
                config={group}
                value={selections[group.key] || ""}
                onChange={(val) => handleSelectionChange(group.key, val)}
              />
            </div>
          ))}
        </div>

        {/* Sub-options dropdown for Group A selections */}
        {selections.groupA && SUB_OPTIONS[selections.groupA] && (
          <div className="mb-10 max-w-md">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Select Position — {selections.groupA}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 hover:text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                >
                  <span className={cn("truncate", !subSelections.groupA && "text-muted-foreground")}>
                    {subSelections.groupA || "Search and select a position..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border border-border shadow-lg rounded-lg">
                <Command>
                  <CommandInput placeholder="Search positions..." />
                  <CommandList>
                    <CommandEmpty>No positions found.</CommandEmpty>
                    <CommandGroup>
                      {SUB_OPTIONS[selections.groupA].map((pos) => (
                        <CommandItem
                          key={pos}
                          value={pos}
                          onSelect={() => handleSubSelectionChange("groupA", pos === subSelections.groupA ? "" : pos)}
                          className="py-2.5 px-3 cursor-pointer font-medium tracking-wide data-[selected='true']:bg-primary/10 data-[selected='true']:text-primary"
                        >
                          <Check className={cn("mr-2 h-4 w-4 shrink-0", subSelections.groupA === pos ? "opacity-100" : "opacity-0")} />
                          <span className="text-sm">{pos}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Reports & Promotions Section */}
        <div className="mt-10 mb-2">
          <h2 className="text-xl font-bold text-foreground mb-1">Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm">Generate reports and track promotions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
            onClick={() => navigate("/reports")}
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">Transfer Reports</h3>
                <p className="text-sm text-muted-foreground">View transfer analytics, charts, and export downloadable reports</p>
              </div>
            </div>
          </Card>
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary hover:bg-primary/10 bg-card group"
            onClick={() => navigate("/promotions")}
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-0.5">Promotions</h3>
                <p className="text-sm text-muted-foreground">Track position changes, career progressions, and promotion history</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 Government of Karnataka. All rights reserved.
      </footer>
    </div>
  );
};

export default Categories;
