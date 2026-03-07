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
import RecurringIncomeForm from "@/components/forms/recurring-income-form";
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
import type { RecurringIncome } from "@/types";

const SOURCE_LABELS: Record<string, string> = {
  salary: "Salary",
  freelance: "Freelance",
  rental: "Rental",
  business: "Business",
  other: "Other"
};

const RecurringIncomePage = () => {
  const [data, setData] = useState<RecurringIncome[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [editingIncome, setEditingIncome] = useState<RecurringIncome | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(paths.RECURRING_INCOME_API);
        const json = await res.json();
        setData(json.data ?? []);
      } catch {
        toast.error("Failed to load recurring income");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const serializeDates = (formData: unknown) => {
    const fd = formData as { start_date: Date; end_date?: Date; [key: string]: unknown };
    return {
      ...fd,
      start_date: format(fd.start_date, "yyyy-MM-dd"),
      end_date: fd.end_date ? format(fd.end_date, "yyyy-MM-dd") : undefined
    };
  };

  const handleAdd = async (formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.RECURRING_INCOME_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeDates(formData))
      });
      if (!res.ok) throw new Error();
      const { data: created } = await res.json();
      setData((prev) => [created, ...prev]);
      toast.success("Recurring income added");
    } catch {
      toast.error("Failed to add recurring income");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number, formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.RECURRING_INCOME_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeDates(formData))
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingIncome(null);
      toast.success("Recurring income updated");
    } catch {
      toast.error("Failed to update recurring income");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    try {
      setTogglingId(id);
      const res = await fetch(`${paths.RECURRING_INCOME_API}/${id}`, {
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
      const res = await fetch(`${paths.RECURRING_INCOME_API}/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recurring income deleted");
    } catch {
      toast.error("Failed to delete recurring income");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<RecurringIncome>[] = useMemo(
    () => [
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => (
          <Badge variant="secondary">{SOURCE_LABELS[getValue() as string] ?? getValue() as string}</Badge>
        )
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
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Edit ${rec.title}`}
                onClick={() => setEditingIncome(rec)}
              >
                <Edit2Icon className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                size="icon-sm"
                aria-label={rec.is_active ? `Pause ${rec.title}` : `Resume ${rec.title}`}
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Delete ${rec.title}`}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete recurring income?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will stop future auto-entries for &ldquo;{rec.title}&rdquo;. Past income already created will remain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(rec.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete{" "}
                      {deletingId === rec.id && <Spinner className="ml-2" />}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        }
      }
    ],
    [togglingId, deletingId]
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto">
      <PageTitle
        title="Recurring Income"
        subtitle="Income sources that are automatically added on a schedule"
        actionSlot={
          <Dialog modal={true}>
            <DialogTrigger asChild>
              <Button variant="default">
                <PlusIcon aria-hidden="true" />
                Add Recurring Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Income</DialogTitle>
              </DialogHeader>
              <RecurringIncomeForm handleSubmit={handleAdd} loading={submitting} />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={data}
          title="Recurring Income"
          loading={loading}
        />
      </div>

      <Dialog
        open={editingIncome !== null}
        onOpenChange={(open) => {
          if (!open) setEditingIncome(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recurring Income</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <RecurringIncomeForm
              data={editingIncome}
              handleSubmit={(formData) => handleEdit(editingIncome.id, formData)}
              loading={submitting}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringIncomePage;
