"use client";
import { useEffect, useMemo, useState } from "react";
import MeasurementForm, {
  MeasurementData
} from "@/components/forms/measurement-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { paths } from "@/constants";
import { PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import type { DateRange as TDateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";

type Measurement = {
  id?: string | number;
  created_at: string;
  weight: number;
  bmi: number;
  bodyFat: number;
  bodyFatWeight?: number;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [shouldShowForm, setShouldShowForm] = useState(false);
  const [data, setData] = useState<Measurement[]>([]);
  const [dateRange, setDateRange] = useState<TDateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const columns: ColumnDef<Measurement>[] = useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: "Date",
        sortingFn: (rowA, rowB, columnId) => {
          const a = new Date(rowA.getValue(columnId)).getTime();
          const b = new Date(rowB.getValue(columnId)).getTime();
          return a - b;
        },
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return format(new Date(date), "PP p");
        }
      },
      {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ getValue }) => {
          return `${Number(getValue()).toFixed(2)} kg`;
        }
      },
      {
        accessorKey: "bmi",
        header: "Body Mass Index",
        cell: ({ getValue }) => {
          return getValue();
        }
      },
      {
        accessorKey: "bodyFat",
        header: "Body Fat",
        cell: ({ getValue }) => {
          return `${Number(getValue()).toFixed(2)} %`;
        }
      },
      {
        accessorKey: "bodyFatWeight",
        header: "Body Fat Weight",
        cell: ({ getValue }) => {
          return `${Number(getValue()).toFixed(2)} kg`;
        }
      }
    ],
    []
  );

  const handleSubmit = async (data: MeasurementData) => {
    try {
      setLoading(true);
      const res = await fetch(`${paths.HEATH_API}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save measurement");
      }

      const resData = await res.json();

      setData((prev) => [...prev, resData.data]);

      toast.success("Data saved successfully", {
        richColors: true
      });

      setShouldShowForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error saving data";
      console.error("Error:", err);
      toast.error(errorMessage, { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (dateRange?.from) {
          params.append("startDate", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          params.append("endDate", dateRange.to.toISOString());
        }
        const res = await fetch(`${paths.HEATH_API}?${params.toString()}`, {
          method: "GET"
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to save measurement");
        }

        const resData = await res.json();

        setData(resData.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error saving data";
        console.log(err);
        toast.error(errorMessage || "Error getting data", { richColors: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Toaster />

      <PageTitle
        title="Health Tracker"
        subtitle="Monitor your body measurements and health progress"
        actionSlot={
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button onClick={() => setShouldShowForm(true)}>
              <PlusIcon /> Measurement
            </Button>
          </div>
        }
      ></PageTitle>

      <Dialog open={shouldShowForm} onOpenChange={setShouldShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Measurement</DialogTitle>
            <DialogDescription>
              Enter your body measurements to track your health progress.
            </DialogDescription>
          </DialogHeader>
          <MeasurementForm onFormSubmit={handleSubmit} loading={loading} />
        </DialogContent>
      </Dialog>

      <div>
        <DataTable
          columns={columns}
          data={data}
          title="Health Data"
          loading={loading}
        />
      </div>
    </div>
  );
}
