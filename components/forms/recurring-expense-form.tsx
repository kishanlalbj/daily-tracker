import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
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
import { paths } from "@/constants";
import { toast } from "sonner";
import { FREQUENCY_OPTIONS } from "@/lib/recurring-utils";
import type { RecurringExpense } from "@/types";

const RecurringExpenseSchema = z
  .object({
    expense_title: z.string().min(1, "Title is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    category: z.coerce.number().min(1, "Category is required"),
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
    start_date: z.date({ error: "Start date is required" }),
    end_date: z.date().optional(),
    categoryId: z.number().optional()
  })
  .refine(
    (data) => !data.end_date || data.end_date >= data.start_date,
    { message: "End date must be after start date", path: ["end_date"] }
  );

type RecurringExpenseFormData = z.infer<typeof RecurringExpenseSchema>;

interface RecurringExpenseFormProps {
  data?: RecurringExpense | null;
  handleSubmit: (data: RecurringExpenseFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  categoryOptions: { label: string; value: number }[];
  isCategoriesLoading?: boolean;
  onCategoryCreated?: (opt: { label: string; value: number }) => void;
}

const RecurringExpenseForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add",
  categoryOptions,
  isCategoriesLoading = false,
  onCategoryCreated
}: RecurringExpenseFormProps) => {
  const [categorySearch, setCategorySearch] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(RecurringExpenseSchema),
    defaultValues: {
      expense_title: data?.expense_title ?? "",
      amount: data?.amount ?? ("" as unknown as number),
      category: data?.categoryId ?? ("" as unknown as number),
      frequency: (data?.frequency ?? "monthly") as RecurringExpenseFormData["frequency"],
      start_date: data?.start_date ? new Date(data.start_date) : new Date(),
      end_date: data?.end_date ? new Date(data.end_date) : undefined
    }
  });

  const { control } = form;

  const handleCreateCategory = async (
    title: string,
    onChange: (value: number) => void
  ) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      setIsCreatingCategory(true);
      const res = await fetch(paths.CATEGORY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create category");
      }
      const { data } = await res.json();
      const newOpt = { label: data.title, value: data.id };
      onCategoryCreated?.(newOpt);
      onChange(newOpt.value);
      setCategorySearch("");
      setCategoryOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Title */}
        <FormField
          name="expense_title"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="recurring-title">Title</Label>
              <Input id="recurring-title" placeholder="e.g. Netflix subscription" {...field} />
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
              <Label htmlFor="recurring-amount">Amount</Label>
              <Input
                id="recurring-amount"
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

        {/* Category */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {field.value
                      ? categoryOptions.find((f) => f.value === field.value)?.label
                      : "Select category"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 overflow-hidden"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                  align="start"
                >
                  <Command className="w-full overflow-hidden md:min-w-[450px]">
                    <CommandInput
                      placeholder="Search category..."
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    {isCategoriesLoading ? (
                      <div className="p-2">
                        <Spinner />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty className="p-2">
                          <button
                            type="button"
                            disabled={isCreatingCategory}
                            onClick={() =>
                              handleCreateCategory(categorySearch, field.onChange)
                            }
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent disabled:opacity-50"
                          >
                            {isCreatingCategory ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <PlusIcon className="h-4 w-4" aria-hidden="true" />
                            )}
                            Create &ldquo;{categorySearch}&rdquo;
                          </button>
                        </CommandEmpty>
                        <CommandGroup className="overflow-hidden">
                          <CommandList onWheel={(e) => e.stopPropagation()}>
                            {categoryOptions.map((opt) => (
                              <CommandItem
                                key={opt.value}
                                value={opt.label}
                                onSelect={() => {
                                  field.onChange(opt.value);
                                  setCategoryOpen(false);
                                }}
                              >
                                {opt.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
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
              <Label htmlFor="recurring-frequency">Frequency</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="recurring-frequency" className="w-full">
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
              <Label>End Date <span className="text-muted-foreground">(optional)</span></Label>
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
          {mode === "add" ? "Add Recurring Expense" : "Update Recurring Expense"}
          {loading && <Spinner className="ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

export default RecurringExpenseForm;
