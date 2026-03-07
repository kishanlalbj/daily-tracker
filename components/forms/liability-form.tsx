import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Liability } from "@/types";

const LIABILITY_TYPE_OPTIONS = [
  { label: "Loan", value: "loan" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Mortgage", value: "mortgage" },
  { label: "Other", value: "other" }
] as const;

const LiabilitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["loan", "credit_card", "mortgage", "other"])
});

type LiabilityFormData = z.infer<typeof LiabilitySchema>;

interface LiabilityFormProps {
  data?: Liability | null;
  handleSubmit: (data: LiabilityFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const LiabilityForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add"
}: LiabilityFormProps) => {
  const form = useForm({
    resolver: zodResolver(LiabilitySchema),
    defaultValues: {
      title: data?.title ?? "",
      amount: data?.amount ?? ("" as unknown as number),
      type: (data?.type ?? "loan") as LiabilityFormData["type"]
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
              <Label htmlFor="liability-title">Liability Name</Label>
              <Input id="liability-title" placeholder="e.g. Home Loan" {...field} />
              <FormMessage />
            </div>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="liability-type">Type</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="liability-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LIABILITY_TYPE_OPTIONS.map((opt) => (
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
          name="amount"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="liability-amount">Outstanding Amount</Label>
              <Input
                id="liability-amount"
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

        <Button className="w-full" disabled={loading} type="submit">
          {mode === "add" ? "Add Liability" : "Update Liability"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default LiabilityForm;
