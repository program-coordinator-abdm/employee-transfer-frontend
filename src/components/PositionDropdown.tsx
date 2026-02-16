import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_POSITIONS, type PositionInfo } from "@/lib/positions";

interface PositionDropdownProps {
  value: string;
  onChange: (position: PositionInfo | null) => void;
  placeholder?: string;
}

const PositionDropdown: React.FC<PositionDropdownProps> = ({ value, onChange, placeholder = "Search and select a position..." }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <Command>
          <CommandInput placeholder="Search positions..." />
          <CommandList className="max-h-[250px]">
            <CommandEmpty>No positions found.</CommandEmpty>
            <CommandGroup heading="Group A — Officers (LRO)">
              {ALL_POSITIONS.filter(p => p.group === "Group A" && p.subGroup === "Officers (LRO)").map((pos) => (
                <CommandItem
                  key={`a-lro-${pos.name}`}
                  value={pos.name}
                  onSelect={() => { onChange(value === pos.name ? null : pos); setOpen(false); }}
                  className="py-2 px-3 cursor-pointer text-sm"
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === pos.name ? "opacity-100" : "opacity-0")} />
                  {pos.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Group A — Doctors (JRO & LRO)">
              {ALL_POSITIONS.filter(p => p.group === "Group A" && p.subGroup === "Doctors (JRO & LRO)").map((pos) => (
                <CommandItem
                  key={`a-jro-${pos.name}`}
                  value={`jro-${pos.name}`}
                  onSelect={() => { onChange(value === pos.name ? null : pos); setOpen(false); }}
                  className="py-2 px-3 cursor-pointer text-sm"
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === pos.name ? "opacity-100" : "opacity-0")} />
                  {pos.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Group B — Officers">
              {ALL_POSITIONS.filter(p => p.group === "Group B").map((pos) => (
                <CommandItem
                  key={`b-${pos.name}`}
                  value={pos.name}
                  onSelect={() => { onChange(value === pos.name ? null : pos); setOpen(false); }}
                  className="py-2 px-3 cursor-pointer text-sm"
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === pos.name ? "opacity-100" : "opacity-0")} />
                  {pos.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Group C — Employees">
              {ALL_POSITIONS.filter(p => p.group === "Group C").map((pos) => (
                <CommandItem
                  key={`c-${pos.name}`}
                  value={pos.name}
                  onSelect={() => { onChange(value === pos.name ? null : pos); setOpen(false); }}
                  className="py-2 px-3 cursor-pointer text-sm"
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === pos.name ? "opacity-100" : "opacity-0")} />
                  {pos.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PositionDropdown;
