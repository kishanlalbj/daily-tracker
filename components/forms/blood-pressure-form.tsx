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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { BloodPressure } from "@/types";

const BPSchema = z.object({
  measured_at: z.date({ error: "Date is required" }),
  measured_time: z.string().min(1, "Time is required"),
  systolic: z.coerce
    .number()
    .int("Must be a whole number")
    .min(60, "Min 60")
    .max(250, "Max 250"),
  diastolic: z.coerce
    .number()
    .int("Must be a whole number")
    .min(40, "Min 40")
    .max(150, "Max 150"),
  pulse: z.union([
    z.coerce.number().int("Must be a whole number").min(30, "Min 30").max(250, "Max 250"),
    z.literal("").transform(() => undefined)
  ]).optional(),
  notes: z.string().max(500, "Max 500 characters").optional()
});

type BPFormData = z.infer<typeof BPSchema>;

interface BloodPressureFormProps {
  data?: BloodPressure | null;
  handleSubmit: (data: { systolic: number; diastolic: number; pulse?: number; notes?: string; measured_at: string }) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const BloodPressureForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add"
}: BloodPressureFormProps) => {
  const [dateOpen, setDateOpen] = useState(false);

  const defaultDate = data?.measured_at ? new Date(data.measured_at) : new Date();
  const defaultTime = data?.measured_at
    ? format(new Date(data.measured_at), "HH:mm")
    : format(new Date(), "HH:mm");

  const form = useForm({
    resolver: zodResolver(BPSchema),
    defaultValues: {
      measured_at: defaultDate,
      measured_time: defaultTime,
      systolic: data?.systolic ?? ("" as unknown as number),
      diastolic: data?.diastolic ?? ("" as unknown as number),
      pulse: data?.pulse ?? ("" as unknown as number),
      notes: data?.notes ?? ""
    }
  });

  const { control } = form;

  const onSubmit = (values: BPFormData) => {
    const [hours, minutes] = values.measured_time.split(":").map(Number);
    const dateTime = new Date(values.measured_at);
    dateTime.setHours(hours, minutes, 0, 0);

    handleSubmit({
      systolic: values.systolic,
      diastolic: values.diastolic,
      pulse: values.pulse as number | undefined,
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
                <Label htmlFor="bp-time">Time</Label>
                <Input id="bp-time" type="time" {...field} />
                <FormMessage />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="systolic"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="bp-systolic">Systolic (mmHg)</Label>
                <Input
                  id="bp-systolic"
                  type="number"
                  placeholder="120"
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
            name="diastolic"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="bp-diastolic">Diastolic (mmHg)</Label>
                <Input
                  id="bp-diastolic"
                  type="number"
                  placeholder="80"
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
        </div>

        <FormField
          name="pulse"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="bp-pulse">Pulse / Heart Rate (bpm) — optional</Label>
              <Input
                id="bp-pulse"
                type="number"
                placeholder="72"
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
              <Label htmlFor="bp-notes">Notes — optional</Label>
              <Textarea
                id="bp-notes"
                placeholder="e.g. after exercise, morning reading..."
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

export default BloodPressureForm;
