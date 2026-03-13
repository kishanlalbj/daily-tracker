"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ActivityIcon,
  Edit2Icon,
  HeartIcon,
  HeartPulseIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import StatsCard from "@/components/stats-card";
import BloodPressureForm from "@/components/forms/blood-pressure-form";
import { ChartLineDual } from "@/components/charts/chart-line-dual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRangePresets } from "@/components/date-range-presets";
import { useDateRange } from "@/contexts/DateRangeContext";
import { paths } from "@/constants";
import {
  classifyBP,
  getBPClassificationColor,
  getBPBadgeVariant
} from "@/lib/health-classifications";
import type { BloodPressure, BPAverages } from "@/types";

export default function BloodPressurePage() {
  const { dateRange, setDateRange } = useDateRange();
  const [data, setData] = useState<BloodPressure[]>([]);
  const [averages, setAverages] = useState<BPAverages>({ systolic: null, diastolic: null, pulse: null });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BloodPressure | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      const res = await fetch(`${paths.BLOOD_PRESSURE_API}?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setAverages(json.averages ?? { systolic: null, diastolic: null, pulse: null });
    } catch {
      toast.error("Failed to load blood pressure data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleAdd = async (formData: { systolic: number; diastolic: number; pulse?: number; notes?: string; measured_at: string }) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.BLOOD_PRESSURE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: created } = await res.json();
      setData((prev) => [created, ...prev]);
      setShowAddForm(false);
      toast.success("Reading added");
      fetchData();
    } catch {
      toast.error("Failed to add reading");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number, formData: { systolic: number; diastolic: number; pulse?: number; notes?: string; measured_at: string }) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.BLOOD_PRESSURE_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setData((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingRecord(null);
      toast.success("Reading updated");
      fetchData();
    } catch {
      toast.error("Failed to update reading");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await fetch(`${paths.BLOOD_PRESSURE_API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reading deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete reading");
    } finally {
      setDeletingId(null);
    }
  };

  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
        .map((r) => ({
          measured_at: r.measured_at,
          systolic: r.systolic,
          diastolic: r.diastolic
        })),
    [data]
  );

  const latestClassification = useMemo(() => {
    if (!data.length) return null;
    const latest = data[0];
    return classifyBP(latest.systolic, latest.diastolic);
  }, [data]);

  const columns: ColumnDef<BloodPressure>[] = useMemo(
    () => [
      {
        accessorKey: "measured_at",
        header: "Date & Time",
        sortingFn: (rowA, rowB, columnId) => {
          return new Date(rowA.getValue(columnId)).getTime() - new Date(rowB.getValue(columnId)).getTime();
        },
        cell: ({ getValue }) => format(new Date(getValue() as string), "PP p")
      },
      {
        accessorKey: "systolic",
        header: "Systolic",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{getValue() as number} mmHg</span>
        )
      },
      {
        accessorKey: "diastolic",
        header: "Diastolic",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{getValue() as number} mmHg</span>
        )
      },
      {
        accessorKey: "pulse",
        header: "Pulse",
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? (
            <span className="font-mono tabular-nums">{v} bpm</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
      },
      {
        id: "classification",
        header: "Status",
        cell: ({ row }) => {
          const { systolic, diastolic } = row.original;
          const classification = classifyBP(systolic, diastolic);
          return (
            <Badge
              variant={getBPBadgeVariant(classification)}
              className={getBPClassificationColor(classification)}
            >
              {classification}
            </Badge>
          );
        }
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? (
            <span className="truncate max-w-xs block text-sm text-muted-foreground">{v}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Edit reading from ${format(new Date(record.measured_at), "PP")}`}
                onClick={() => setEditingRecord(record)}
              >
                <Edit2Icon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Delete reading from ${format(new Date(record.measured_at), "PP")}`}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete reading?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the reading from{" "}
                      {format(new Date(record.measured_at), "PP p")}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(record.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete{" "}
                      {deletingId === record.id && <Spinner className="ml-2" />}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        }
      }
    ],
    [deletingId]
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle
        title="Blood Pressure Monitor"
        subtitle="Track your systolic, diastolic and pulse readings over time."
        actionSlot={
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <PlusIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Reading
            </Button>
          </div>
        }
      />

      <DateRangePresets value={dateRange} onChange={setDateRange} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Avg Systolic"
          value={averages.systolic !== null ? `${averages.systolic} mmHg` : "—"}
          icon={HeartPulseIcon}
          subtitle="Upper reading"
        />
        <StatsCard
          title="Avg Diastolic"
          value={averages.diastolic !== null ? `${averages.diastolic} mmHg` : "—"}
          icon={ActivityIcon}
          subtitle="Lower reading"
        />
        <StatsCard
          title="Avg Pulse"
          value={averages.pulse !== null ? `${averages.pulse} bpm` : "—"}
          icon={HeartIcon}
          subtitle="Heart rate"
        />
        <StatsCard
          title="Latest Status"
          value={latestClassification ?? "—"}
          icon={ShieldIcon}
          subtitle={
            latestClassification
              ? `${data[0]?.systolic}/${data[0]?.diastolic} mmHg`
              : "No readings yet"
          }
        />
      </div>

      {chartData.length > 1 && (
        <ChartLineDual
          title="Blood Pressure Trend"
          description="Systolic and diastolic readings over time"
          chartData={chartData}
          line1={{ dataKey: "systolic", label: "Systolic", color: "var(--chart-1)" }}
          line2={{ dataKey: "diastolic", label: "Diastolic", color: "var(--chart-2)" }}
          dateKey="measured_at"
        />
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        title="Readings"
      />

      {/* Add Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add BP Reading</DialogTitle>
            <DialogDescription>
              Record a new blood pressure measurement.
            </DialogDescription>
          </DialogHeader>
          <BloodPressureForm handleSubmit={handleAdd} loading={submitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingRecord !== null}
        onOpenChange={(open) => { if (!open) setEditingRecord(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit BP Reading</DialogTitle>
            <DialogDescription>
              Update your blood pressure measurement.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <BloodPressureForm
              data={editingRecord}
              handleSubmit={(formData) => handleEdit(editingRecord.id, formData)}
              loading={submitting}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
