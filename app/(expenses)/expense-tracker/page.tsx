"use client";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { Edit2Icon, PlusIcon, TrashIcon, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ExpenseForm from "@/components/forms/expense-form";
import { paths } from "@/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/page-title";
import { formatCurrency } from "@/lib/dashboard-helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRangePresets } from "@/components/date-range-presets";
import type { DateRange as TDateRange } from "react-day-picker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Expense } from "@/types";
import Link from "next/link";

interface CategoryOption {
  label: string;
  value: number;
}

interface ExpenseActionsProps {
  dateRange: TDateRange | undefined;
  onDateRangeChange: (range: TDateRange | undefined) => void;
  onSubmit: (data: unknown) => void;
  loading: boolean;
  categoryOptions: CategoryOption[];
  isCategoriesLoading: boolean;
  onCategoryCreated: (opt: CategoryOption) => void;
}

const ExpenseActions = ({
  dateRange,
  onDateRangeChange,
  onSubmit,
  loading,
  categoryOptions,
  isCategoriesLoading,
  onCategoryCreated
}: ExpenseActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      <div>
        <Link href="/expense-tracker/import">
          <Button variant="outline">
            <UploadIcon aria-hidden="true" />
          </Button>
        </Link>
      </div>
      <Dialog modal={true}>
        <DialogTrigger asChild>
          <Button variant="default">
            <PlusIcon aria-hidden="true" /> Expense
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            handleSubmit={onSubmit}
            loading={loading}
            categoryOptions={categoryOptions}
            isCategoriesLoading={isCategoriesLoading}
            onCategoryCreated={onCategoryCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ExpenseTrackerPage = () => {
  const { dateRange, setDateRange } = useDateRange();
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const uniqueCategories = useMemo(
    () =>
      [...new Set(data.map((e) => e.category?.title).filter(Boolean))].sort(),
    [data]
  );

  const columnFilters = useMemo<ColumnFiltersState>(
    () => (categoryFilter ? [{ id: "category", value: categoryFilter }] : []),
    [categoryFilter]
  );

  const [loaders, setLoaders] = useState({
    delete: false
  });

  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const res = await fetch(paths.CATEGORY_API);
        const resData = await res.json();
        setCategoryOptions(
          resData.data.map((opt: { id: number; title: string }) => ({
            label: opt.title,
            value: opt.id
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryCreated = (opt: CategoryOption) => {
    setCategoryOptions((prev) => [...prev, opt]);
  };

  const handleExpenseSubmit = async (data: unknown) => {
    try {
      setLoading(true);
      const res = await fetch(`${paths.EXPENSE_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      setData((prev) => [{ ...result.data }, ...prev]);

      toast.success("Data saved successfully", {
        richColors: true
      });
    } catch (error) {
      console.error(error);
      toast.error("Error saving data", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = async (id: string | number, data: Expense) => {
    try {
      setLoading(true);
      const res = await fetch(`${paths.EXPENSE_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...data })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to edit expense");
      }

      const result = await res.json();

      setData((prev) =>
        prev.map((expense) =>
          expense.id === result.data.id ? { ...result.data } : expense
        )
      );
      toast.success("Expense updated successfully", { richColors: true });
    } catch (error) {
      console.error(error);
      toast.error("Error updating expense", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoaders((prev) => ({ ...prev, delete: true }));
      const res = await fetch(`${paths.EXPENSE_API}/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete expense");
      }
      setData((prev) => prev.filter((expense) => expense.id !== id));
      toast.success("Expense deleted successfully", { richColors: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting expense";
      toast.error(errorMessage, { richColors: true });
    } finally {
      setLoaders((prev) => ({ ...prev, delete: false }));
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateRange?.from) {
          params.append("startDate", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          params.append("endDate", dateRange.to.toISOString());
        }
        const res = await fetch(`${paths.EXPENSE_API}?${params.toString()}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch expenses");
        }

        const result = await res.json();

        setData(result.data);
      } catch (error) {
        console.error(error);
        toast.error("Error getting data", { richColors: true });
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [dateRange]);

  const columns: ColumnDef<Expense>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return format(date, "PP");
        }
      },
      {
        accessorKey: "expense_title",
        header: "Expense Title",
        cell: ({ getValue }) => (
          <p className="whitespace-normal wrap-break-words">
            {getValue() as string}
          </p>
        )
      },
      {
        accessorKey: "category",
        header: "Category",
        filterFn: (row, columnId, filterValue: string) => {
          const cat = row.getValue(columnId) as { title: string };
          return cat?.title === filterValue;
        },
        cell: ({ getValue }) => {
          const cat = getValue() as { title: string };
          return <Badge variant="secondary">{cat.title}</Badge>;
        }
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <p className="tabular-nums text-destructive font-medium">
            - ${formatCurrency(getValue() as number)}
          </p>
        )
      },
      {
        accessorKey: "Actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Dialog modal={true}>
              <DialogTrigger asChild>
                <Button variant="outline" size={"icon-sm"}>
                  <Edit2Icon />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  data={{
                    ...row.original,
                    category: row.original.categoryId || 0,
                    date: new Date(row.original.date)
                  }}
                  handleSubmit={(data) =>
                    handleEditExpense(
                      row.original.id as string | number,
                      data as unknown as Expense
                    )
                  }
                  loading={loading}
                  mode="edit"
                  categoryOptions={categoryOptions}
                  isCategoriesLoading={isCategoriesLoading}
                  onCategoryCreated={handleCategoryCreated}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size={"icon-sm"}>
                  <TrashIcon />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the expense from our database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      row.original.id !== undefined &&
                      handleDelete(row.original.id)
                    }
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete {loaders.delete ? <Spinner /> : ""}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      }
    ],
    [loaders.delete, loading, categoryOptions, isCategoriesLoading]
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto">
      <PageTitle
        title="Expense Tracker"
        subtitle="Track and manage your daily expenses"
        actionSlot={
          <ExpenseActions
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onSubmit={handleExpenseSubmit}
            loading={loading}
            categoryOptions={categoryOptions}
            isCategoriesLoading={isCategoriesLoading}
            onCategoryCreated={handleCategoryCreated}
          />
        }
      ></PageTitle>

      <DateRangePresets
        value={dateRange}
        onChange={setDateRange}
        className="my-4"
      />

      <div>
        <DataTable
          columns={columns}
          data={data}
          title="Expenses"
          loading={loading}
          columnFilters={columnFilters}
          toolbar={
            uniqueCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={!categoryFilter ? "secondary" : "ghost"}
                  size="sm"
                  className={
                    !categoryFilter ? "border border-foreground/30" : ""
                  }
                  onClick={() => setCategoryFilter("")}
                >
                  All
                </Button>
                {uniqueCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "secondary" : "ghost"}
                    size="sm"
                    className={
                      categoryFilter === cat
                        ? "border border-foreground/30"
                        : ""
                    }
                    onClick={() =>
                      setCategoryFilter(categoryFilter === cat ? "" : cat)
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
