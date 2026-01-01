"use client";
import { paths } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange as TDateRange } from "react-day-picker";
import { ChartLineLinear } from "@/components/charts/chart-line-linear";
import StatsCard from "@/components/stats-card";
import { type TrendDirection } from "@/lib/trend-utils";
import { ChartBarDefault } from "@/components/charts/bar-chart";
import { ChartPieDonut } from "@/components/charts/pie-chart";
import {
  calculateTrendFromData,
  formatCurrency,
  getBMICategory
} from "@/lib/dashboard-helpers";
import PageTitle from "@/components/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

type DashboardData = {
  health: {
    latest: {
      weight: number;
      bodyFat: number;
      bmi: number;
    };
    trends: Array<{ created_at: string; weight: number }>;
    trendDirections: {
      weight: {
        direction: TrendDirection;
        change: number;
      };
      bodyFat: {
        direction: TrendDirection;
        change: number;
      };
      bmi: {
        direction: TrendDirection;
        change: number;
      };
    };
    bodyComposition: {
      message: string;
      color: string;
    };
    idealWeight: number | null;
    weightGoal: {
      message: string;
      difference: number;
      color: string;
    } | null;
  };
  expenses: {
    summary: {
      total: number;
      transactionCount: number;
      average: number;
      changeFromPreviousPeriod: number;
    };
    trends: Array<{ created_at: string; total: number }>;
    trendDirections: {
      total: {
        direction: TrendDirection;
        change: number;
      };
    };
    topSpendingCategory: {
      categoryId: number;
      category: string;
      total: number;
      transactionCount: number;
      percentage: number;
    } | null;
    categoryBreakdown: Array<{
      categoryId: number;
      category: string;
      total: number;
      transactionCount: number;
      percentage: number;
    }>;
    recentTransactions: Array<{
      id: number;
      date: Date;
      expense_title: string;
      amount: number;
      categoryId: number;
      category: {
        id: number;
        title: string;
      };
    }>;
  };
};

const DashboardPage = () => {
  const user = useUser();

  const [data, setData] = useState<DashboardData>();

  const [dateRange, setDateRange] = useState<TDateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) {
          params.append("startDate", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          params.append("endDate", dateRange.to.toISOString());
        }

        const res = await fetch(`${paths.DASHBOARD_API}?${params.toString()}`);

        const result = await res.json();

        setData(result?.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [dateRange]);

  const bmiTrend = calculateTrendFromData(
    data?.health?.trendDirections?.bmi?.direction,
    data?.health?.trendDirections?.bmi?.change
  );

  const expensesTrend = calculateTrendFromData(
    data?.expenses?.trendDirections?.total?.direction,
    data?.expenses?.trendDirections?.total?.change
  );

  const bmiCategory = getBMICategory(data?.health?.latest?.bmi);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 max-w-7xl">
      <PageTitle
        title="Dashboard"
        subtitle={`Hello, ${user?.first_name} ${user?.last_name}`}
        actionSlot={
          <>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </>
        }
      ></PageTitle>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expense</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="my-2">
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatsCard
                title="Total Expenses"
                subtitle={
                  expensesTrend
                    ? `${expensesTrend.symbol} ${expensesTrend.displayText}`
                    : "-"
                }
                value={formatCurrency(data?.expenses?.summary.total)}
              />

              <StatsCard
                title="Daily Average"
                subtitle={`${
                  data?.expenses?.summary.transactionCount || 0
                } transactions`}
                value={formatCurrency(data?.expenses?.summary.average)}
              />

              <StatsCard
                title="Top Spending Category"
                subtitle={formatCurrency(
                  data?.expenses?.topSpendingCategory?.total
                )}
                value={
                  data?.expenses?.topSpendingCategory?.category
                    ? data.expenses.topSpendingCategory.category
                    : "-"
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <ChartBarDefault
                chartData={data?.expenses?.trends || []}
                dataKey="total"
                metricLabel="Total Expenses "
                title="Expenses Over Time"
                className="w-full h-80 md:h-96"
              ></ChartBarDefault>

              <ChartPieDonut
                chartData={data?.expenses?.categoryBreakdown || []}
                dataKey="total"
                nameKey="category"
                metricLabel="Expenses by Category"
                title="Expenses by Category"
                className="w-full h-80 md:h-96"
              ></ChartPieDonut>
            </div>
          </>
        </TabsContent>

        <TabsContent value="health" className="my-2">
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatsCard
                title="Body Composition"
                subtitle={
                  data?.health?.bodyComposition ? (
                    <span className={data.health.bodyComposition.color}>
                      {data.health.bodyComposition.message}
                    </span>
                  ) : (
                    ""
                  )
                }
                value={
                  data?.health?.latest?.bodyFat
                    ? `${data.health.latest.bodyFat}%`
                    : "-"
                }
              />
              <StatsCard
                title="Body Mass Index (BMI)"
                subtitle={
                  <span className={bmiCategory.color}>
                    {bmiCategory.category}
                    {bmiTrend && (
                      <span className="ml-2 text-muted-foreground inline-flex items-center">
                        {bmiTrend.symbol === "+" ? (
                          <TrendingUpIcon color="red" size={16} />
                        ) : (
                          <TrendingDownIcon color="green" size={16} />
                        )}
                      </span>
                    )}
                  </span>
                }
                value={data?.health?.latest?.bmi || "-"}
              />
              <StatsCard
                title="Ideal Weight"
                subtitle="Based on healthy BMI"
                value={
                  data?.health?.idealWeight
                    ? `${data.health.idealWeight} kg`
                    : "-"
                }
              />
              <StatsCard
                title="Current Weight"
                subtitle={
                  data?.health?.weightGoal ? (
                    <span className={data.health.weightGoal.color}>
                      {data.health.weightGoal.message}
                    </span>
                  ) : (
                    ""
                  )
                }
                value={
                  data?.health?.latest?.weight
                    ? `${Number(data.health.latest.weight).toFixed(1)} kg`
                    : "-"
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <ChartLineLinear
                chartData={data?.health?.trends || []}
                dataKey="weight"
                metricLabel="Weight (kg)"
                title="Weight Trends"
                description="Showing your weight progression over time"
                trendDirection={
                  data?.health?.trendDirections?.weight?.direction
                }
                trendChange={data?.health?.trendDirections?.weight?.change}
                trendLabel="selected period"
                color="var(--chart-1)"
              />

              <ChartLineLinear
                chartData={data?.health?.trends || []}
                dataKey="bodyFat"
                metricLabel="Body Fat (%)"
                title="Body Fat Trends"
                description="Showing your Body Fat progression over time"
                trendDirection={
                  data?.health?.trendDirections?.bodyFat?.direction
                }
                trendChange={data?.health?.trendDirections?.bodyFat?.change}
                trendLabel="selected period"
                color="var(--chart-2)"
              />
            </div>
          </>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
