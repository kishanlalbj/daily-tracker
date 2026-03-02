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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { paths } from "@/constants";
import { toast } from "sonner";

const ExpenseSchema = z.object({
  expense_title: z.string().min(1, "Expense title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.coerce.number().min(1, "Category is required"),
  date: z.date(),
  categoryId: z.number().optional()
});

type ExpenseFormData = z.infer<typeof ExpenseSchema>;

interface ExpenseFormProps {
  data?: ExpenseFormData | null;
  handleSubmit: (data: ExpenseFormData) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  categoryOptions: { label: string; value: number }[];
  isCategoriesLoading?: boolean;
  onCategoryCreated?: (opt: { label: string; value: number }) => void;
}

const ExpenseForm = ({
  data,
  handleSubmit,
  loading,
  mode = "add",
  categoryOptions,
  isCategoriesLoading = false,
  onCategoryCreated
}: ExpenseFormProps) => {
  const [categorySearch, setCategorySearch] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const form = useForm({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      date: data?.date ? new Date(data.date) : new Date(),
      expense_title: data?.expense_title || "",
      amount: data?.amount || "",
      category: data?.categoryId || ""
    }
  });
  const [open, setOpen] = useState(false);

  const { control } = form;

  const onSubmit = (data: ExpenseFormData) => {
    handleSubmit(data);
  };

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
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            name="date"
            control={control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </div>
              );
            }}
          />
          <FormField
            name="expense_title"
            control={control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input type="text" placeholder="Title" {...field}></Input>
                  <FormMessage></FormMessage>
                </div>
              );
            }}
          />

          <FormField
            name="amount"
            control={control}
            render={({ field }) => {
              return (
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={field.value ? (field.value as number) : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  ></Input>
                  <FormMessage></FormMessage>
                </div>
              );
            }}
          ></FormField>

          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Category</Label>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {field.value
                        ? categoryOptions.find((f) => f.value === field.value)
                            ?.label
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
                                handleCreateCategory(
                                  categorySearch,
                                  field.onChange
                                )
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
                            <CommandList
                              onWheel={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {categoryOptions.map((opt) => (
                                <CommandItem
                                  key={opt.value}
                                  value={opt.label}
                                  onSelect={() => {
                                    field.onChange(opt.value);
                                    setOpen(false);
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

          <Button className="w-full" disabled={loading} type="submit">
            {mode === "add" ? "Add Expense" : "Update Expense"}
            {loading && <Spinner className="ml-2" />}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ExpenseForm;
