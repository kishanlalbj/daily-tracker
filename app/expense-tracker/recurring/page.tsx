"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Edit2Icon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
  TrashIcon
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import RecurringExpenseForm from "@/components/forms/recurring-expense-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
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

import { paths } from "@/constants";
import { formatCurrency } from "@/lib/dashboard-helpers";
import { FREQUENCY_LABELS } from "@/lib/recurring-utils";
import type { RecurringExpense } from "@/types";

interface CategoryOption {
  label: string;
  value: number;
}

const RecurringExpensesPage = () => {
  const [data, setData] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [recurringRes, categoryRes] = await Promise.all([
          fetch(paths.RECURRING_EXPENSE_API),
          fetch(paths.CATEGORY_API)
        ]);
        const [recurringData, categoryData] = await Promise.all([
          recurringRes.json(),
          categoryRes.json()
        ]);
        setData(recurringData.data ?? []);
        setCategoryOptions(
          categoryData.data.map((opt: { id: number; title: string }) => ({
            label: opt.title,
            value: opt.id
          }))
        );
      } catch {
        toast.error("Failed to load recurring expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

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
    } catch {
      /* silent */
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const handleCategoryCreated = (opt: CategoryOption) => {
    setCategoryOptions((prev) => [...prev, opt]);
  };

  const handleAdd = async (formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.RECURRING_EXPENSE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: created } = await res.json();
      setData((prev) => [created, ...prev]);
      toast.success("Recurring expense added");
    } catch {
      toast.error("Failed to add recurring expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number, formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.RECURRING_EXPENSE_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success("Recurring expense updated");
    } catch {
      toast.error("Failed to update recurring expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    try {
      setTogglingId(id);
      const res = await fetch(`${paths.RECURRING_EXPENSE_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive })
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(currentActive ? "Paused" : "Resumed");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await fetch(`${paths.RECURRING_EXPENSE_API}/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recurring expense deleted");
    } catch {
      toast.error("Failed to delete recurring expense");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<RecurringExpense>[] = useMemo(
    () => [
      {
        accessorKey: "expense_title",
        header: "Title"
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const cat = getValue() as { title: string };
          return <Badge variant="secondary">{cat.title}</Badge>;
        }
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(getValue() as number)}
          </span>
        )
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-sm">
            <RepeatIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            {FREQUENCY_LABELS[getValue() as keyof typeof FREQUENCY_LABELS]}
          </span>
        )
      },
      {
        accessorKey: "next_run_date",
        header: "Next Run",
        cell: ({ getValue }) => format(new Date(getValue() as string), "PP")
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => {
          const active = getValue() as boolean;
          return (
            <Badge variant={active ? "default" : "outline"}>
              {active ? "Active" : "Paused"}
            </Badge>
          );
        }
      },
      {
        accessorKey: "Actions",
        header: "Actions",
        cell: ({ row }) => {
          const rec = row.original;
          return (
            <div className="flex items-center gap-2">
              {/* Edit */}
              <Dialog modal={true}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Edit ${rec.expense_title}`}
                    onClick={fetchCategories}
                  >
                    <Edit2Icon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Recurring Expense</DialogTitle>
                  </DialogHeader>
                  <RecurringExpenseForm
                    data={rec}
                    handleSubmit={(formData) => handleEdit(rec.id, formData)}
                    loading={submitting}
                    mode="edit"
                    categoryOptions={categoryOptions}
                    isCategoriesLoading={isCategoriesLoading}
                    onCategoryCreated={handleCategoryCreated}
                  />
                </DialogContent>
              </Dialog>

              {/* Pause / Resume */}
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={rec.is_active ? `Pause ${rec.expense_title}` : `Resume ${rec.expense_title}`}
                disabled={togglingId === rec.id}
                onClick={() => handleToggle(rec.id, rec.is_active)}
              >
                {togglingId === rec.id ? (
                  <Spinner className="h-4 w-4" />
                ) : rec.is_active ? (
                  <PauseIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PlayIcon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Delete ${rec.expense_title}`}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete recurring expense?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will stop future auto-entries for &ldquo;{rec.expense_title}&rdquo;.
                      Past expenses already created will remain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(rec.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete {deletingId === rec.id && <Spinner className="ml-2" />}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        }
      }
    ],
    [submitting, togglingId, deletingId, categoryOptions, isCategoriesLoading]
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto">
      <PageTitle
        title="Recurring Expenses"
        subtitle="Expenses that are automatically added on a schedule"
        actionSlot={
          <Dialog modal={true}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={fetchCategories}>
                <PlusIcon aria-hidden="true" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Expense</DialogTitle>
              </DialogHeader>
              <RecurringExpenseForm
                handleSubmit={handleAdd}
                loading={submitting}
                categoryOptions={categoryOptions}
                isCategoriesLoading={isCategoriesLoading}
                onCategoryCreated={handleCategoryCreated}
              />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={data}
          title="Recurring Expenses"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default RecurringExpensesPage;
