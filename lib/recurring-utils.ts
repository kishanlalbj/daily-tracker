import { addDays, addMonths, addYears, startOfDay } from "date-fns";

/** Parse a YYYY-MM-DD string as local midnight. Avoids the UTC offset shift
 *  that `new Date("YYYY-MM-DD")` causes on UTC+ servers. */
export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export function advanceByFrequency(date: Date, frequency: Frequency): Date {
  switch (frequency) {
    case "daily":    return addDays(date, 1);
    case "weekly":   return addDays(date, 7);
    case "biweekly": return addDays(date, 14);
    case "monthly":  return addMonths(date, 1);
    case "yearly":   return addYears(date, 1);
  }
}

/**
 * Returns the first occurrence of the recurring schedule that falls on or after today.
 * If start_date is today or in the future, it is returned as-is.
 */
export function computeNextRunDate(startDate: Date, frequency: Frequency): Date {
  let next = startOfDay(startDate);
  const today = startOfDay(new Date());
  while (next < today) {
    next = advanceByFrequency(next, frequency);
  }
  return next;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily:    "Daily",
  weekly:   "Weekly",
  biweekly: "Every 2 Weeks",
  monthly:  "Monthly",
  yearly:   "Yearly"
};

export const FREQUENCY_OPTIONS: { label: string; value: Frequency }[] = [
  { label: "Daily",         value: "daily" },
  { label: "Weekly",        value: "weekly" },
  { label: "Every 2 Weeks", value: "biweekly" },
  { label: "Monthly",       value: "monthly" },
  { label: "Yearly",        value: "yearly" }
];
