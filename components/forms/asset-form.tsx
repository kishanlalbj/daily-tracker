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
import type { Asset } from "@/types";

const ASSET_TYPE_OPTIONS = [
  { label: "Cash / Bank", value: "cash" },
  { label: "Property", value: "property" },
  { label: "Stocks / Mutual Funds", value: "stocks" },
  { label: "Vehicle", value: "vehicle" },
  { label: "Other", value: "other" }
] as const;

const AssetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.coerce.number().min(0.01, "Value must be greater than 0"),
  type: z.enum(["cash", "property", "stocks", "vehicle", "other"]),
  date: z.date({ error: "Date is required" })
});

type AssetFormData = z.infer<typeof AssetSchema>;

interface AssetFormProps {
  data?: Asset | null;
  handleSubmit: (data: AssetFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const AssetForm = ({ data, handleSubmit, loading, mode = "add" }: AssetFormProps) => {
  const [dateOpen, setDateOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(AssetSchema),
    defaultValues: {
      title: data?.title ?? "",
      value: data?.value ?? ("" as unknown as number),
      type: (data?.type ?? "cash") as AssetFormData["type"],
      date: data?.date ? new Date(data.date) : new Date()
    }
  });

  const { control } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          name="title"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="asset-title">Asset Name</Label>
              <Input id="asset-title" placeholder="e.g. HDFC Savings Account" {...field} />
              <FormMessage />
            </div>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="asset-type">Type</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="asset-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPE_OPTIONS.map((opt) => (
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
          name="value"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="asset-value">Current Value</Label>
              <Input
                id="asset-value"
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

        <FormField
          name="date"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>As of Date</Label>
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
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </div>
          )}
        />

        <Button className="w-full" disabled={loading} type="submit">
          {mode === "add" ? "Add Asset" : "Update Asset"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default AssetForm;
