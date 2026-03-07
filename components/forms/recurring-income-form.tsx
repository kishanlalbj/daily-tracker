import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FREQUENCY_OPTIONS } from "@/lib/recurring-utils";
import type { RecurringIncome } from "@/types";

const SOURCE_OPTIONS = [
  { label: "Salary", value: "salary" },
  { label: "Freelance", value: "freelance" },
  { label: "Rental", value: "rental" },
  { label: "Business", value: "business" },
  { label: "Other", value: "other" }
] as const;

const RecurringIncomeSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    source: z.enum(["salary", "freelance", "rental", "business", "other"]),
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
    start_date: z.date({ error: "Start date is required" }),
    end_date: z.date().optional()
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.start_date,
    { message: "End date must be after start date", path: ["end_date"] }
  );

type RecurringIncomeFormData = z.infer<typeof RecurringIncomeSchema>;

interface RecurringIncomeFormProps {
  data?: RecurringIncome | null;
  handleSubmit: (data: RecurringIncomeFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const RecurringIncomeForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add"
}: RecurringIncomeFormProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(RecurringIncomeSchema),
    defaultValues: {
      title: data?.title ?? "",
      amount: data?.amount ?? ("" as unknown as number),
      source: (data?.source ?? "salary") as RecurringIncomeFormData["source"],
      frequency: (data?.frequency ?? "monthly") as RecurringIncomeFormData["frequency"],
      start_date: data?.start_date ? new Date(data.start_date) : new Date(),
      end_date: data?.end_date ? new Date(data.end_date) : undefined
    }
  });

  const { control } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Title */}
        <FormField
          name="title"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="income-title">Title</Label>
              <Input id="income-title" placeholder="e.g. Monthly Salary" {...field} />
              <FormMessage />
            </div>
          )}
        />

        {/* Source */}
        <FormField
          control={control}
          name="source"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="income-source">Source</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="income-source" className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </div>
          )}
        />

        {/* Amount */}
        <FormField
          name="amount"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                placeholder="0.00"
                type="number"
                className="font-mono tabular-nums"
                value={field.value ? (field.value as number) : ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <FormMessage />
            </div>
          )}
        />

        {/* Frequency */}
        <FormField
          control={control}
          name="frequency"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="income-frequency">Frequency</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="income-frequency" className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </div>
          )}
        />

        {/* Start Date */}
        <FormField
          name="start_date"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </div>
          )}
        />

        {/* End Date (optional) */}
        <FormField
          name="end_date"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>
                End Date <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {field.value ? format(field.value, "PPP") : <span>No end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setEndDateOpen(false);
                    }}
                  />
                  {field.value && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        type="button"
                        onClick={() => {
                          field.onChange(undefined);
                          setEndDateOpen(false);
                        }}
                      >
                        Clear end date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <FormMessage />
            </div>
          )}
        />

        <Button className="w-full" disabled={loading} type="submit">
          {mode === "add" ? "Add Recurring Income" : "Update Recurring Income"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default RecurringIncomeForm;
