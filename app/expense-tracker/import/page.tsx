"use client";
import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { paths } from "@/constants";
import { formatCurrency } from "@/lib/dashboard-helpers";
import { Expense } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ExpenseUploadViewPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Expense[]>([]);
  const [loaders, setLoaders] = useState({
    fetch: false,
    save: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleBulkSave = async () => {
    try {
      setLoaders((prev) => ({
        ...prev,
        fetch: true
      }));
      const dataToSave = previewData.map(({ category, ...rest }) => rest);

      await fetch(`${paths.EXPENSE_API}/import`, {
        method: "POST",
        body: JSON.stringify(dataToSave)
      });

      toast.success("Data saved successfully");

      router.push("/expense-tracker");
    } catch (err) {
      toast.error("Error saving expenses");
    }
  };

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
        header: "Title",
        cell: ({ getValue }) => (
          <p className="whitespace-normal wrap-break-words">
            {getValue() as string}
          </p>
        )
      },
      {
        accessorKey: "category.title",
        header: "Category",
        cell: ({ getValue }) => {
          const cat = getValue() as string;
          return <Badge variant="secondary">{cat}</Badge>;
        }
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => `- ${formatCurrency(getValue() as number)}`
      }
    ],
    []
  );

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!file) {
        setPreviewData([]);
        setLoaders((prev) => ({
          ...prev,
          fetch: false
        }));
        return;
      }
      setLoaders((prev) => ({
        ...prev,
        fetch: true
      }));
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(`${paths.EXPENSE_API}/import/preview`, {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        setPreviewData(result.data || []);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        setPreviewData([]);
      } finally {
        setLoaders((prev) => ({
          ...prev,
          fetch: false
        }));
      }
    };
    fetchPreviewData();
  }, [file]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 max-w-7xl">
      <PageTitle
        title="Import Expenses"
        subtitle="Upload a HDFC format CSV file to import your expenses"
        actionSlot={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".csv"
                  onChange={handleFileChange}
                ></input>
                <Button variant="outline" className="mt-4" asChild>
                  <label htmlFor="file-upload">Choose File</label>
                </Button>
              </div>
            </div>
          </>
        }
      ></PageTitle>

      {!file && (
        <div className="flex items-center justify-center h-45">
          <p className="text-muted-foreground">
            Upload a hdfc format statement to view preview
          </p>
        </div>
      )}

      {file && loaders.fetch && (
        <>
          <p className="text-muted-foreground inline-flex items-center gap-2">
            Analyzing... <Spinner />{" "}
          </p>
        </>
      )}

      {file && !loaders.fetch && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="my-2 text-sm">
              <span className="text-muted-foreground">File: </span>
              {file.name}
            </p>
            <p className="my-2 text-sm">
              <span className="text-muted-foreground">Total Records: </span>
              {previewData.length}
            </p>
          </div>
          <div className="space-y-6">
            <DataTable columns={columns} data={previewData} title="Preview" />

            <Button className="w-full" onClick={handleBulkSave}>
              Save {loaders.save && <Spinner />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseUploadViewPage;
