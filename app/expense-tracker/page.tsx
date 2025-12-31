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
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ExpenseForm from "@/components/forms/expense-form";
import { paths } from "@/constants";
import { format } from "date-fns";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/page-title";
import { Input } from "@/components/ui/input";

type Expense = {
  id?: string | number;
  date: string;
  expense_title: string;
  amount: number;
  category: {
    title: string;
  };
};

const ExpenseTrackerPage = () => {
  const [data, setData] = useState<Expense[]>([]);

  const handleExpenseSubmit = async (data: unknown) => {
    try {
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
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${paths.EXPENSE_API}`);

        const result = await res.json();

        setData(result.data);
      } catch (error) {
        console.error(error);
        toast.error("Error getting data", { richColors: true });
      }
    };

    fetchExpenses();
  }, []);

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
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const cat = getValue() as { title: string };
          return <Badge variant="default">{cat.title}</Badge>;
        }
      },
      {
        accessorKey: "expense_title",
        header: "Expense Title",
        cell: ({ getValue }) => getValue()
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => `₹${getValue()}`
      }
    ],
    []
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Toaster />

      <PageTitle
        title="Expense Tracker"
        subtitle="Track and manage your daily expenses"
        actionSlot={
          <div className="flex items-center gap-4">
            {/* <div className="flex-inline">
              <Button type="button" variant={"outline"}>
                <UploadIcon />
              </Button>
            </div> */}
            <Dialog modal={true}>
              <DialogTrigger asChild>
                <Button variant={"default"}>
                  <PlusIcon /> Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm handleSubmit={handleExpenseSubmit} />
              </DialogContent>
            </Dialog>
            {/* <Input type="file"> */}
            {/* </Input> */}
          </div>
        }
      ></PageTitle>

      <div>
        <DataTable columns={columns} data={data} title="Expenses" />
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
