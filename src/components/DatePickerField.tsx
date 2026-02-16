import React, { useState } from "react";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DatePickerFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left h-12 text-sm bg-card border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover border border-border shadow-lg rounded-lg" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => { onChange(d); setOpen(false); }}
          disabled={disabled}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={2030}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerField;

export function calculateTenure(from: Date, to: Date): string {
  const years = differenceInYears(to, from);
  const months = differenceInMonths(to, from) % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" ") : "< 1 month";
}
