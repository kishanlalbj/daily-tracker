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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { FinancialGoal } from "@/types";

const GoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target_amount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  target_date: z.date({ error: "Target date is required" })
});

type GoalFormData = z.infer<typeof GoalSchema>;

interface GoalFormProps {
  data?: FinancialGoal | null;
  handleSubmit: (data: GoalFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
}

const GoalForm = ({ data, handleSubmit, loading, mode = "add" }: GoalFormProps) => {
  const [dateOpen, setDateOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(GoalSchema),
    defaultValues: {
      title: data?.title ?? "",
      target_amount: data?.target_amount ?? ("" as unknown as number),
      target_date: data?.target_date ? new Date(data.target_date) : undefined
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
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input id="goal-title" placeholder="e.g. Emergency Fund" {...field} />
              <FormMessage />
            </div>
          )}
        />

        <FormField
          name="target_amount"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Target Amount</Label>
              <Input
                id="goal-amount"
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
          name="target_date"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Target Date</Label>
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
          {mode === "add" ? "Add Goal" : "Update Goal"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default GoalForm;
