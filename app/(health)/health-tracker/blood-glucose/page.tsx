"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropletIcon,
  Edit2Icon,
  FlaskConicalIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import StatsCard from "@/components/stats-card";
import BloodGlucoseForm from "@/components/forms/blood-glucose-form";
import { ChartLineLinear } from "@/components/charts/chart-line-linear";
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
  classifyGlucose,
  getGlucoseClassificationColor,
  getGlucoseBadgeVariant
} from "@/lib/health-classifications";
import type { BloodGlucose, GlucoseAverages, GlucoseMeasurementType } from "@/types";

const MEASUREMENT_TYPE_LABELS: Record<GlucoseMeasurementType, string> = {
  fasting: "Fasting",
  post_meal: "Post-meal (2h)",
  random: "Random",
  bedtime: "Bedtime"
};

export default function BloodGlucosePage() {
  const { dateRange, setDateRange } = useDateRange();
  const [data, setData] = useState<BloodGlucose[]>([]);
  const [averages, setAverages] = useState<GlucoseAverages>({
    fasting: null,
    post_meal: null,
    random: null,
    bedtime: null
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BloodGlucose | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      const res = await fetch(`${paths.BLOOD_GLUCOSE_API}?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setAverages(
        json.averages ?? { fasting: null, post_meal: null, random: null, bedtime: null }
      );
    } catch {
      toast.error("Failed to load blood glucose data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleAdd = async (formData: { glucose_level: number; measurement_type: GlucoseMeasurementType; notes?: string; measured_at: string }) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.BLOOD_GLUCOSE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      setShowAddForm(false);
      toast.success("Reading added");
      fetchData();
    } catch {
      toast.error("Failed to add reading");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: number, formData: { glucose_level: number; measurement_type: GlucoseMeasurementType; notes?: string; measured_at: string }) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.BLOOD_GLUCOSE_API}/${id}`, {
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
      const res = await fetch(`${paths.BLOOD_GLUCOSE_API}/${id}`, { method: "DELETE" });
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
          glucose_level: Number(r.glucose_level)
        })),
    [data]
  );

  const latestClassification = useMemo(() => {
    if (!data.length) return null;
    const latest = data[0];
    return classifyGlucose(Number(latest.glucose_level), latest.measurement_type);
  }, [data]);

  const columns: ColumnDef<BloodGlucose>[] = useMemo(
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
        accessorKey: "glucose_level",
        header: "Glucose",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{Number(getValue() as number).toFixed(1)} mg/dL</span>
        )
      },
      {
        accessorKey: "measurement_type",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {MEASUREMENT_TYPE_LABELS[getValue() as GlucoseMeasurementType]}
          </Badge>
        )
      },
      {
        id: "classification",
        header: "Status",
        cell: ({ row }) => {
          const { glucose_level, measurement_type } = row.original;
          const classification = classifyGlucose(Number(glucose_level), measurement_type);
          return (
            <Badge
              variant={getGlucoseBadgeVariant(classification)}
              className={getGlucoseClassificationColor(classification)}
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
        title="Blood Glucose Monitor"
        subtitle="Track fasting, post-meal, and random glucose readings."
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
          title="Avg Fasting"
          value={averages.fasting !== null ? `${averages.fasting} mg/dL` : "—"}
          icon={FlaskConicalIcon}
          subtitle="Fasting glucose"
        />
        <StatsCard
          title="Avg Post-meal"
          value={averages.post_meal !== null ? `${averages.post_meal} mg/dL` : "—"}
          icon={DropletIcon}
          subtitle="2h after meal"
        />
        <StatsCard
          title="Avg Random"
          value={averages.random !== null ? `${averages.random} mg/dL` : "—"}
          icon={DropletIcon}
          subtitle="Random readings"
        />
        <StatsCard
          title="Latest Status"
          value={latestClassification ?? "—"}
          icon={ShieldIcon}
          subtitle={
            data.length
              ? `${Number(data[0].glucose_level).toFixed(1)} mg/dL · ${MEASUREMENT_TYPE_LABELS[data[0].measurement_type]}`
              : "No readings yet"
          }
        />
      </div>

      {chartData.length > 1 && (
        <ChartLineLinear
          title="Glucose Trend"
          chartData={chartData}
          dataKey="glucose_level"
          metricLabel="Glucose (mg/dL)"
          color="var(--chart-3)"
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
            <DialogTitle>Add Glucose Reading</DialogTitle>
            <DialogDescription>
              Record a new blood glucose measurement.
            </DialogDescription>
          </DialogHeader>
          <BloodGlucoseForm handleSubmit={handleAdd} loading={submitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editingRecord !== null}
        onOpenChange={(open) => { if (!open) setEditingRecord(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Glucose Reading</DialogTitle>
            <DialogDescription>
              Update your blood glucose measurement.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <BloodGlucoseForm
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
