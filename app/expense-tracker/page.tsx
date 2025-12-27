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
// import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ExpenseForm from "@/components/expense-form";
import { BASE_API_URL, paths } from "@/constants";
import { format } from "date-fns";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
      const res = await fetch(`${BASE_API_URL}${paths.EXPENSE_API}`, {
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
        const res = await fetch(`${BASE_API_URL}${paths.EXPENSE_API}`);

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
    <div>
      <Toaster />
      <div className="flex items-center h-14 justify-between">
        <div className="flex items-center gap-2">
          <h1>Expense Tracker</h1>
        </div>
      </div>

      <div className="flex items-center justify-end my-4">
        <Dialog modal={true}>
          <DialogTrigger asChild>
            <Button variant={"default"}>
              <PlusIcon /> Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense </DialogTitle>
            </DialogHeader>
            <ExpenseForm handleSubmit={handleExpenseSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <DataTable columns={columns} data={data} title="Expenses" />
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
