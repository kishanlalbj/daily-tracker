import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

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

const ExpenseSchema = z.object({
  expense_title: z.string().min(1, "Expense title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.coerce.number().min(1, "Category is required"),
  date: z.date()
});

type Category = {
  id: string | number;
  title: string;
  created_at?: string;
};

type ExpenseFormData = z.infer<typeof ExpenseSchema>;

interface ExpenseFormProps {
  handleSubmit: (data: ExpenseFormData) => void;
  loading?: boolean;
}

const ExpenseForm = ({ handleSubmit, loading }: ExpenseFormProps) => {
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      date: undefined,
      expense_title: "",
      amount: "",
      category: ""
    }
  });
  const [open, setOpen] = useState(false);

  const { control } = form;

  const onSubmit = (data: ExpenseFormData) => {
    handleSubmit(data);
  };

  useEffect(() => {
    const getCategoryOptions = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await fetch(`${paths.CATEGORY_API}`);

        const resData = await res.json();

        const formattedOptions = resData.data.map((opt: Category) => ({
          label: opt.title,
          value: opt.id
        }));

        setCategoryOptions(formattedOptions);
      } catch (error) {
        console.log(error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    getCategoryOptions();
  }, []);

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
                    value={Number(field.value)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    className="w-full p-0"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput placeholder="Search category..." />

                      {isCategoriesLoading ? (
                        <div>
                          <Spinner />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No category found.</CommandEmpty>

                          <CommandGroup>
                            <CommandList>
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
            Add Expense
            {loading && <Spinner className="ml-2" />}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ExpenseForm;
