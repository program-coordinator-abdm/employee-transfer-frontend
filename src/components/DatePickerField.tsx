import React, { useState } from "react";
import { format, differenceInMonths, differenceInYears, setMonth, setYear } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DatePickerFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value || new Date());

  const years = Array.from({ length: 2030 - 1950 + 1 }, (_, i) => 1950 + i);

  const handleMonthChange = (month: string) => {
    setViewDate(setMonth(viewDate, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    setViewDate(setYear(viewDate, parseInt(year)));
  };

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
        <div className="p-3 pb-0 flex items-center gap-2">
          <Select value={viewDate.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-9 flex-1 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewDate.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="h-9 w-24 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          month={viewDate}
          onMonthChange={setViewDate}
          selected={value}
          onSelect={(d) => { onChange(d); setOpen(false); }}
          disabled={disabled}
          initialFocus
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
