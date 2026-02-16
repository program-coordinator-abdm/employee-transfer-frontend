import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_POSITIONS, type PositionInfo } from "@/lib/positions";

interface PositionDropdownProps {
  value: string;
  onChange: (position: PositionInfo | null) => void;
  placeholder?: string;
}

const GROUPS = [
  { group: "Group A", subGroup: "Officers (LRO)", heading: "Group A — Officers (LRO)", prefix: "a-lro" },
  { group: "Group A", subGroup: "Doctors (JRO & LRO)", heading: "Group A — Doctors (JRO & LRO)", prefix: "a-jro" },
  { group: "Group B", subGroup: "Officers", heading: "Group B — Officers", prefix: "b" },
  { group: "Group C", subGroup: "Employees", heading: "Group C — Employees", prefix: "c" },
];

const PositionDropdown: React.FC<PositionDropdownProps> = ({ value, onChange, placeholder = "Search and select a position..." }) => {
  const [open, setOpen] = useState(false);
  const [otherGroup, setOtherGroup] = useState<{ group: string; subGroup: string } | null>(null);
  const [otherText, setOtherText] = useState("");

  const handleOtherSelect = (group: string, subGroup: string) => {
    setOtherGroup({ group, subGroup });
    setOtherText("");
  };

  const handleOtherConfirm = () => {
    if (otherText.trim()) {
      onChange({ name: otherText.trim(), group: otherGroup!.group, subGroup: otherGroup!.subGroup });
      setOtherGroup(null);
      setOtherText("");
      setOpen(false);
    }
  };

  const handleCancelOther = () => {
    setOtherGroup(null);
    setOtherText("");
  };

  // Check if current value is a custom "Others" entry
  const isOtherValue = value && !ALL_POSITIONS.some(p => p.name === value);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) handleCancelOther(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border border-border shadow-lg rounded-lg max-h-[300px]">
        {otherGroup ? (
          <div className="p-3 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Enter designation for {otherGroup.group} — {otherGroup.subGroup}
            </p>
            <Input
              placeholder="Type designation name..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleOtherConfirm(); }}
              autoFocus
              className="h-10"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancelOther}>
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleOtherConfirm} disabled={!otherText.trim()}>
                <Check className="w-3 h-3 mr-1" /> Confirm
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Search positions..." />
            <CommandList className="max-h-[250px]">
              <CommandEmpty>No positions found.</CommandEmpty>
              {GROUPS.map(({ group, subGroup, heading, prefix }) => (
                <CommandGroup key={prefix} heading={heading}>
                  {ALL_POSITIONS.filter(p => p.group === group && p.subGroup === subGroup).map((pos) => (
                    <CommandItem
                      key={`${prefix}-${pos.name}`}
                      value={prefix === "a-jro" ? `jro-${pos.name}` : pos.name}
                      onSelect={() => { onChange(value === pos.name ? null : pos); setOpen(false); }}
                      className="py-2 px-3 cursor-pointer text-sm"
                    >
                      <Check className={cn("mr-2 h-4 w-4 shrink-0", value === pos.name ? "opacity-100" : "opacity-0")} />
                      {pos.name}
                    </CommandItem>
                  ))}
                  <CommandItem
                    key={`${prefix}-others`}
                    value={`${prefix}-others`}
                    onSelect={() => handleOtherSelect(group, subGroup)}
                    className="py-2 px-3 cursor-pointer text-sm italic text-muted-foreground"
                  >
                    <Check className="mr-2 h-4 w-4 shrink-0 opacity-0" />
                    Others (Enter manually)
                  </CommandItem>
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PositionDropdown;
