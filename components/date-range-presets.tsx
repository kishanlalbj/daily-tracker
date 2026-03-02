"use client";

import { format, isSameDay } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePresetsProps {
  value: DateRange | undefined;
  onChange: (range: DateRange) => void;
  className?: string;
}

const getPresets = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const quick = [
    { label: "Last 7 Days", range: { from: last7Days, to: today } },
    { label: "This Month", range: { from: thisMonthStart, to: today } }
  ];

  const months = Array.from({ length: 6 }, (_, i) => {
    const offset = i + 1;
    const from = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const to = new Date(today.getFullYear(), today.getMonth() - offset + 1, 0);
    return { label: format(from, "MMM yyyy"), range: { from, to } };
  });

  return [...quick, ...months];
};

const isActivePreset = (
  preset: { from: Date; to: Date },
  range: DateRange | undefined
) =>
  !!range?.from &&
  !!range?.to &&
  isSameDay(preset.from, range.from) &&
  isSameDay(preset.to, range.to);

export function DateRangePresets({
  value,
  onChange,
  className
}: DateRangePresetsProps) {
  return (
    <div
      data-slot="date-range-presets"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {getPresets().map((preset) => (
        <Button
          key={preset.label}
          variant={
            isActivePreset(preset.range, value) ? "secondary" : "outline"
          }
          size="sm"
          className={
            isActivePreset(preset.range, value)
              ? "border border-foreground/30"
              : ""
          }
          onClick={() => onChange(preset.range)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
