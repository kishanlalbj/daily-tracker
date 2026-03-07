"use client";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit2Icon, PlusIcon, TrashIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import PageTitle from "@/components/page-title";
import StatsCard from "@/components/stats-card";
import AssetForm from "@/components/forms/asset-form";
import LiabilityForm from "@/components/forms/liability-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { paths } from "@/constants";
import { formatCurrency } from "@/lib/dashboard-helpers";
import type { Asset, Liability } from "@/types";

const ASSET_TYPE_LABELS: Record<string, string> = {
  cash: "Cash / Bank",
  property: "Property",
  stocks: "Stocks",
  vehicle: "Vehicle",
  other: "Other"
};

const LIABILITY_TYPE_LABELS: Record<string, string> = {
  loan: "Loan",
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  other: "Other"
};

const AssetPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<{ type: "asset" | "liability"; id: number } | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [assetRes, liabilityRes] = await Promise.all([
          fetch(paths.ASSETS_API),
          fetch(paths.LIABILITIES_API)
        ]);
        const [assetData, liabilityData] = await Promise.all([
          assetRes.json(),
          liabilityRes.json()
        ]);
        setAssets(assetData.data ?? []);
        setLiabilities(liabilityData.data ?? []);
      } catch {
        toast.error("Failed to load net worth data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalAssets = useMemo(
    () => assets.reduce((sum, a) => sum + Number(a.value), 0),
    [assets]
  );
  const totalLiabilities = useMemo(
    () => liabilities.reduce((sum, l) => sum + Number(l.amount), 0),
    [liabilities]
  );
  const netWorth = totalAssets - totalLiabilities;

  const serializeDate = (formData: unknown) => {
    const fd = formData as { date: Date; [key: string]: unknown };
    return { ...fd, date: format(fd.date, "yyyy-MM-dd") };
  };

  const handleAddAsset = async (formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.ASSETS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeDate(formData))
      });
      if (!res.ok) throw new Error();
      const { data: created } = await res.json();
      setAssets((prev) => [created, ...prev]);
      toast.success("Asset added");
    } catch {
      toast.error("Failed to add asset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAsset = async (id: number, formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.ASSETS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeDate(formData))
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingAsset(null);
      toast.success("Asset updated");
    } catch {
      toast.error("Failed to update asset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    try {
      setDeletingId({ type: "asset", id });
      const res = await fetch(`${paths.ASSETS_API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success("Asset deleted");
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddLiability = async (formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(paths.LIABILITIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: created } = await res.json();
      setLiabilities((prev) => [created, ...prev]);
      toast.success("Liability added");
    } catch {
      toast.error("Failed to add liability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLiability = async (id: number, formData: unknown) => {
    try {
      setSubmitting(true);
      const res = await fetch(`${paths.LIABILITIES_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      const { data: updated } = await res.json();
      setLiabilities((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditingLiability(null);
      toast.success("Liability updated");
    } catch {
      toast.error("Failed to update liability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLiability = async (id: number) => {
    try {
      setDeletingId({ type: "liability", id });
      const res = await fetch(`${paths.LIABILITIES_API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLiabilities((prev) => prev.filter((l) => l.id !== id));
      toast.success("Liability deleted");
    } catch {
      toast.error("Failed to delete liability");
    } finally {
      setDeletingId(null);
    }
  };

  const assetColumns: ColumnDef<Asset>[] = useMemo(
    () => [
      { accessorKey: "title", header: "Asset" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {ASSET_TYPE_LABELS[getValue() as string] ?? (getValue() as string)}
          </Badge>
        )
      },
      {
        accessorKey: "date",
        header: "As of",
        cell: ({ getValue }) => format(new Date(getValue() as string), "PP")
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-right block text-emerald-600 dark:text-emerald-400">
            {formatCurrency(getValue() as number)}
          </span>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const asset = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Edit ${asset.title}`}
                onClick={() => setEditingAsset(asset)}
              >
                <Edit2Icon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon-sm" aria-label={`Delete ${asset.title}`}>
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove &ldquo;{asset.title}&rdquo; from your assets.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete{" "}
                      {deletingId?.type === "asset" && deletingId.id === asset.id && (
                        <Spinner className="ml-2" />
                      )}
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

  const liabilityColumns: ColumnDef<Liability>[] = useMemo(
    () => [
      { accessorKey: "title", header: "Liability" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {LIABILITY_TYPE_LABELS[getValue() as string] ?? (getValue() as string)}
          </Badge>
        )
      },
      {
        accessorKey: "amount",
        header: "Outstanding",
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums text-right block text-destructive">
            {formatCurrency(getValue() as number)}
          </span>
        )
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const liability = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Edit ${liability.title}`}
                onClick={() => setEditingLiability(liability)}
              >
                <Edit2Icon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon-sm" aria-label={`Delete ${liability.title}`}>
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete liability?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove &ldquo;{liability.title}&rdquo; from your liabilities.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteLiability(liability.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete{" "}
                      {deletingId?.type === "liability" && deletingId.id === liability.id && (
                        <Spinner className="ml-2" />
                      )}
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

  const NetWorthIcon = netWorth > 0 ? TrendingUpIcon : netWorth < 0 ? TrendingDownIcon : MinusIcon;

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle
        title="Assets and Liabilities"
        subtitle="Track your assets and liabilities to get a clear picture of your net worth."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Assets"
          value={formatCurrency(totalAssets)}
          icon={TrendingUpIcon}
          subtitle={`${assets.length} assets`}
        />
        <StatsCard
          title="Total Liabilities"
          value={formatCurrency(totalLiabilities)}
          icon={TrendingDownIcon}
          subtitle={`${liabilities.length} liabilities`}
        />
        <StatsCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          icon={NetWorthIcon}
          subtitle={netWorth >= 0 ? "Assets exceed liabilities" : "Liabilities exceed assets"}
        />
      </div>

      {/* Assets table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Assets</CardTitle>
            <Dialog modal={true}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <PlusIcon aria-hidden="true" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Asset</DialogTitle>
                </DialogHeader>
                <AssetForm handleSubmit={handleAddAsset} loading={submitting} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={assetColumns} data={assets} loading={loading} title="Assets" />
        </CardContent>
      </Card>

      {/* Liabilities table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Liabilities</CardTitle>
            <Dialog modal={true}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <PlusIcon aria-hidden="true" />
                  Add Liability
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Liability</DialogTitle>
                </DialogHeader>
                <LiabilityForm handleSubmit={handleAddLiability} loading={submitting} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={liabilityColumns} data={liabilities} loading={loading} title="Liabilities" />
        </CardContent>
      </Card>

      {/* Edit Asset Dialog */}
      <Dialog
        open={editingAsset !== null}
        onOpenChange={(open) => { if (!open) setEditingAsset(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <AssetForm
              data={editingAsset}
              handleSubmit={(formData) => handleEditAsset(editingAsset.id, formData)}
              loading={submitting}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Liability Dialog */}
      <Dialog
        open={editingLiability !== null}
        onOpenChange={(open) => { if (!open) setEditingLiability(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Liability</DialogTitle>
          </DialogHeader>
          {editingLiability && (
            <LiabilityForm
              data={editingLiability}
              handleSubmit={(formData) => handleEditLiability(editingLiability.id, formData)}
              loading={submitting}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetPage;
