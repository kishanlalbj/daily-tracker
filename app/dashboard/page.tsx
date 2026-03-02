"use client";
import { paths } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange as TDateRange } from "react-day-picker";
import { ChartLineLinear } from "@/components/charts/chart-line-linear";
import StatsCard from "@/components/stats-card";
import { ChartBarDefault } from "@/components/charts/bar-chart";
import { ChartPieDonut } from "@/components/charts/pie-chart";
import {
  calculateTrendFromData,
  formatCurrency,
  getBMICategory
} from "@/lib/dashboard-helpers";
import PageTitle from "@/components/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircleIcon,
  Banknote,
  BarChart3,
  Scale,
  Tag,
  Target,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet
} from "lucide-react";
import Loading from "./loading";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { DashboardData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const DashboardPage = () => {
  const user = useUser();

  const [data, setData] = useState<DashboardData>();
  const [loading, setLoading] = useState<boolean>(true);

  const [dateRange, setDateRange] = useState<TDateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

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

        const res = await fetch(`${paths.DASHBOARD_API}?${params.toString()}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch dashboard");
        }

        const result = await res.json();
        setData(result?.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error fetching data";
        console.error("Error:", err);
        toast.error(errorMessage, { richColors: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const bmiTrend = calculateTrendFromData(
    data?.health?.trendDirections?.bmi?.direction,
    data?.health?.trendDirections?.bmi?.change
  );

  const bmiCategory = getBMICategory(data?.health?.latest?.bmi);

  const expenseDirection = data?.expenses?.trendDirections?.total?.direction;
  const expenseChange = data?.expenses?.trendDirections?.total?.change ?? 0;

  const recentTransactions = data?.expenses?.recentTransactions ?? [];

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto">
      <PageTitle
        title="Dashboard"
        subtitle={`Hello, ${user?.first_name} ${user?.last_name}`}
        actionSlot={<DateRangePicker value={dateRange} onChange={setDateRange} />}
      />

      {(!user?.gender || !user.height) && (
        <Alert variant={"warning"} className="mb-6">
          <AlertCircleIcon />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            Your profile is incomplete. Please complete your profile{" "}
            <Link href={"/profile"} className="underline">
              here
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* ── Expenses Tab ── */}
        <TabsContent value="expenses" className="mt-6">
          {loading ? (
            <Loading />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Expenses"
                  value={formatCurrency(data?.expenses?.summary.total)}
                  icon={Wallet}
                  trend={
                    expenseDirection
                      ? {
                          direction: expenseDirection,
                          change: expenseChange,
                          isPositiveGood: false
                        }
                      : undefined
                  }
                  subtitle="vs. previous period"
                />

                <StatsCard
                  title="Avg. per Transaction"
                  value={formatCurrency(data?.expenses?.summary.average)}
                  icon={BarChart3}
                  subtitle={`${data?.expenses?.summary.transactionCount ?? 0} transactions`}
                />

                <StatsCard
                  title="Top Category"
                  value={
                    data?.expenses?.topSpendingCategory?.category ?? "–"
                  }
                  icon={Tag}
                  subtitle={formatCurrency(
                    data?.expenses?.topSpendingCategory?.total
                  )}
                />

                <StatsCard
                  title="Total Investments"
                  value={formatCurrency(data?.expenses?.totalInvestments)}
                  icon={Banknote}
                  subtitle="Across investment categories"
                />
              </div>

              {/* Charts row — 3:2 split */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <ChartBarDefault
                    chartData={data?.expenses?.trends ?? []}
                    dataKey="total"
                    metricLabel="Total Expenses"
                    title="Spending Over Time"
                    className="w-full h-72"
                  />
                </div>
                <div className="lg:col-span-2">
                  <ChartPieDonut
                    chartData={data?.expenses?.categoryBreakdown ?? []}
                    dataKey="total"
                    nameKey="category"
                    metricLabel="Expenses by Category"
                    title="Category Breakdown"
                    className="w-full h-72"
                  />
                </div>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>
                        {recentTransactions.length > 0
                          ? `Latest ${recentTransactions.length} transactions in this period`
                          : "No transactions in this period"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/expense-tracker">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentTransactions.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-t border-b bg-muted/50">
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground"
                          >
                            Category
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-muted-foreground"
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((tx, idx) => (
                          <tr
                            key={tx.id}
                            className={
                              idx < recentTransactions.length - 1
                                ? "border-b border-border/60 hover:bg-muted/30 transition-colors"
                                : "hover:bg-muted/30 transition-colors"
                            }
                          >
                            <td className="px-6 py-3 text-sm font-medium max-w-[180px] truncate">
                              {tx.expense_title}
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant="secondary" className="text-xs">
                                {tx.category.title}
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                              {format(new Date(tx.date), "MMM dd, yyyy")}
                            </td>
                            <td className="px-6 py-3 text-sm font-mono tabular-nums text-right">
                              {formatCurrency(Number(tx.amount))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No transactions recorded in this period
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── Health Tab ── */}
        <TabsContent value="health" className="mt-6">
          {loading ? (
            <Loading />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Body Fat %"
                  value={
                    data?.health?.latest?.bodyFat
                      ? `${data.health.latest.bodyFat}%`
                      : "–"
                  }
                  icon={Activity}
                  subtitle={
                    data?.health?.bodyComposition ? (
                      <span className={data.health.bodyComposition.color}>
                        {data.health.bodyComposition.message}
                      </span>
                    ) : undefined
                  }
                />

                <StatsCard
                  title="Body Mass Index"
                  value={data?.health?.latest?.bmi ?? "–"}
                  icon={BarChart3}
                  subtitle={
                    <span className={bmiCategory.color}>
                      {bmiCategory.category}
                      {bmiTrend && (
                        <span className="ml-1.5 inline-flex items-center text-muted-foreground">
                          {bmiTrend.symbol === "+" ? (
                            <TrendingUpIcon className="h-3 w-3 text-red-500" aria-hidden="true" />
                          ) : (
                            <TrendingDownIcon className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                          )}
                        </span>
                      )}
                    </span>
                  }
                />

                <StatsCard
                  title="Ideal Weight"
                  value={
                    data?.health?.idealWeight
                      ? `${data.health.idealWeight} kg`
                      : "–"
                  }
                  icon={Target}
                  subtitle="Based on healthy BMI"
                />

                <StatsCard
                  title="Current Weight"
                  value={
                    data?.health?.latest?.weight
                      ? `${Number(data.health.latest.weight).toFixed(1)} kg`
                      : "–"
                  }
                  icon={Scale}
                  subtitle={
                    data?.health?.weightGoal ? (
                      <span className={data.health.weightGoal.color}>
                        {data.health.weightGoal.message}
                      </span>
                    ) : undefined
                  }
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartLineLinear
                  chartData={data?.health?.trends ?? []}
                  dataKey="weight"
                  metricLabel="Weight (kg)"
                  title="Weight Trend"
                  description="Your weight progression over time"
                  trendDirection={
                    data?.health?.trendDirections?.weight?.direction
                  }
                  trendChange={data?.health?.trendDirections?.weight?.change}
                  trendLabel="selected period"
                  color="var(--chart-1)"
                />

                <ChartLineLinear
                  chartData={data?.health?.trends ?? []}
                  dataKey="bodyFat"
                  metricLabel="Body Fat (%)"
                  title="Body Fat Trend"
                  description="Your body fat progression over time"
                  trendDirection={
                    data?.health?.trendDirections?.bodyFat?.direction
                  }
                  trendChange={data?.health?.trendDirections?.bodyFat?.change}
                  trendLabel="selected period"
                  color="var(--chart-2)"
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
