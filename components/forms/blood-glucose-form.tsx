import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { BloodGlucose, GlucoseMeasurementType } from "@/types";

const MEASUREMENT_TYPE_OPTIONS: { label: string; value: GlucoseMeasurementType }[] = [
  { label: "Fasting", value: "fasting" },
  { label: "Post-meal (2h)", value: "post_meal" },
  { label: "Random", value: "random" },
  { label: "Bedtime", value: "bedtime" }
];

const GlucoseSchema = z.object({
  measured_at: z.date({ error: "Date is required" }),
  measured_time: z.string().min(1, "Time is required"),
  glucose_level: z.coerce
    .number()
    .min(20, "Min 20 mg/dL")
    .max(600, "Max 600 mg/dL"),
  measurement_type: z.enum(["fasting", "post_meal", "random", "bedtime"]),
  notes: z.string().max(500, "Max 500 characters").optional()
});

type GlucoseFormData = z.infer<typeof GlucoseSchema>;

interface BloodGlucoseFormProps {
  data?: BloodGlucose | null;
  handleSubmit: (data: {
    glucose_level: number;
    measurement_type: GlucoseMeasurementType;
    notes?: string;
    measured_at: string;
  }) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const BloodGlucoseForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add"
}: BloodGlucoseFormProps) => {
  const [dateOpen, setDateOpen] = useState(false);

  const defaultDate = data?.measured_at ? new Date(data.measured_at) : new Date();
  const defaultTime = data?.measured_at
    ? format(new Date(data.measured_at), "HH:mm")
    : format(new Date(), "HH:mm");

  const form = useForm({
    resolver: zodResolver(GlucoseSchema),
    defaultValues: {
      measured_at: defaultDate,
      measured_time: defaultTime,
      glucose_level: data?.glucose_level ?? ("" as unknown as number),
      measurement_type: (data?.measurement_type ?? "fasting") as GlucoseFormData["measurement_type"],
      notes: data?.notes ?? ""
    }
  });

  const { control } = form;

  const onSubmit = (values: GlucoseFormData) => {
    const [hours, minutes] = values.measured_time.split(":").map(Number);
    const dateTime = new Date(values.measured_at);
    dateTime.setHours(hours, minutes, 0, 0);

    handleSubmit({
      glucose_level: values.glucose_level,
      measurement_type: values.measurement_type,
      notes: values.notes || undefined,
      measured_at: dateTime.toISOString()
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="measured_at"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDateOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </div>
            )}
          />

          <FormField
            name="measured_time"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="glucose-time">Time</Label>
                <Input id="glucose-time" type="time" {...field} />
                <FormMessage />
              </div>
            )}
          />
        </div>

        <FormField
          name="measurement_type"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="glucose-type">Measurement Type</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="glucose-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_TYPE_OPTIONS.map((opt) => (
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

        <FormField
          name="glucose_level"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="glucose-level">Glucose Level (mg/dL)</Label>
              <Input
                id="glucose-level"
                type="number"
                placeholder="100"
                className="font-mono tabular-nums"
                value={field.value ? (field.value as number) : ""}
                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
              <FormMessage />
            </div>
          )}
        />

        <FormField
          name="notes"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="glucose-notes">Notes — optional</Label>
              <Textarea
                id="glucose-notes"
                placeholder="e.g. before breakfast, 2h after lunch..."
                className="resize-none"
                rows={2}
                {...field}
              />
              <FormMessage />
            </div>
          )}
        />

        <Button className="w-full" disabled={loading} type="submit">
          {mode === "add" ? "Add Reading" : "Update Reading"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default BloodGlucoseForm;
