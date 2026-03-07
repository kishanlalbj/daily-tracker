"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TrashIcon, TrendingUpIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import StatsCard from "@/components/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { paths } from "@/constants";
import { formatCurrency } from "@/lib/dashboard-helpers";
import { useDateRange } from "@/contexts/DateRangeContext";
import type { Income } from "@/types";

const SOURCE_LABELS: Record<string, string> = {
  salary: "Salary",
  freelance: "Freelance",
  rental: "Rental",
  business: "Business",
  other: "Other"
};

const IncomeTrackerPage = () => {
  const [data, setData] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { dateRange, setDateRange } = useDateRange();

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
        if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

        const res = await fetch(`${paths.INCOME_API}?${params.toString()}`);
        const json = await res.json();
        setData(json.data ?? []);
      } catch {
        toast.error("Failed to load income");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [dateRange]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await fetch(paths.INCOME_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((r) => r.id !== id));
      toast.success("Income entry deleted");
    } catch {
      toast.error("Failed to delete income entry");
    } finally {
      setDeletingId(null);
    }
  };

  const totalIncome = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.amount), 0),
    [data]
  );

  const columns: ColumnDef<Income>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => format(new Date(getValue() as string), "PP")
      },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {SOURCE_LABELS[getValue() as string] ?? (getValue() as string)}
          </Badge>
        )
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-right block">
            {formatCurrency(getValue() as number)}
          </span>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const income = row.original;
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  aria-label={`Delete ${income.title}`}
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete income entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this income record. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(income.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete{" "}
                    {deletingId === income.id && <Spinner className="ml-2" />}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        }
      }
    ],
    [deletingId]
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle
        title="Income Tracker"
        subtitle="Auto-generated income entries from your recurring income sources"
        actionSlot={<DateRangePicker value={dateRange} onChange={setDateRange} />}
      />

      <DateRangePresets value={dateRange} onChange={setDateRange} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUpIcon}
          subtitle={`${data.length} entries`}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        title="Income Entries"
        loading={loading}
      />
    </div>
  );
};

export default IncomeTrackerPage;
