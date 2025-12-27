"use client";
import { useEffect, useMemo, useState } from "react";
import MeasurementForm, {
  MeasurementData
} from "@/components/measurement-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
  const [stats, setStats] = useState({
    bmi: 0,
    weight: 0,
    bodyFat: 0
  });
  const [data, setData] = useState<Measurement[]>([]);

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
          return getValue();
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
          return getValue();
        }
      },
      {
        accessorKey: "bodyFatWeight",
        header: "Body Fat Weight",
        cell: ({ getValue }) => {
          return getValue();
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
      const resData = await res.json();

      setData((prev) => [...prev, { ...resData.data }]);

      toast.success("Data saved successfully", {
        richColors: true
      });

      setShouldShowForm(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${paths.HEATH_API}`, {
          method: "GET"
        });
        const resData = await res.json();

        setData(resData.data);

        setStats((prev) => ({
          ...prev,
          bmi: resData.averages.bmi,
          bodyFat: resData.averages.bodyFat,
          weight: resData.averages.weight
        }));
      } catch (err) {
        console.log(err);
        toast.error("Error getting data", { richColors: true });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Toaster />

      <div className="h-14 flex items-center justify-between">
        <h1>Health Tracker</h1>
      </div>
      <div className="flex items-center justify-end my-4">
        <Button onClick={() => setShouldShowForm(true)}>
          <PlusIcon /> Measurement
        </Button>
      </div>

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
        <h1 className="text-xl font-semibold"> Last 7 Days Average</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <Card>
            <CardHeader>
              <CardTitle>Body Mass Index</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>

            <CardContent>
              <span className="text-3xl font-bold">{stats.bmi}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Fat</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>

            <CardContent>
              <span className="text-3xl font-bold">{stats.bodyFat}%</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Average Weight</CardTitle>
              <CardDescription>
                <p> {"       "} </p>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <span className="text-3xl font-bold">{stats.weight}</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <DataTable columns={columns} data={data} title="Health Data" />
    </div>
  );
}
