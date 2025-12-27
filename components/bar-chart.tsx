"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { getTrendInfo, type TrendDirection } from "@/lib/trend-utils";

interface ChartBarProps {
  chartData: Array<Record<string, string | number>>;
  title: string;
  description?: string;
  trendDirection?: TrendDirection;
  trendChange?: number;
  trendLabel?: string;
  dataKey: string;
  xAxisKey?: string;
  metricLabel?: string;
  color?: string;
  xAxisFormatter?: (value: string) => string;
  className?: string;
}

export function ChartBarDefault({
  chartData,
  title,
  description,
  trendDirection,
  trendChange,
  trendLabel,
  dataKey,
  xAxisKey = "created_at",
  metricLabel,
  color = "var(--chart-1)",
  xAxisFormatter,
  className
}: ChartBarProps) {
  const chartConfig = {
    [dataKey]: {
      label: metricLabel || dataKey,
      color: color
    }
  } satisfies ChartConfig;

  const trendInfo =
    trendDirection && trendChange !== undefined
      ? getTrendInfo(trendDirection, trendChange)
      : null;

  const defaultFormatter = (value: string) => {
    try {
      return format(new Date(value), "LLL dd");
    } catch {
      return value.slice(0, 3);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={className}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={xAxisFormatter || defaultFormatter}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {trendInfo && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {trendInfo.symbol === "+" ? (
              <>
                {trendInfo.displayText} {trendLabel && `in ${trendLabel}`}
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : trendInfo.symbol === "-" ? (
              <>
                {trendInfo.displayText} {trendLabel && `in ${trendLabel}`}
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            ) : (
              <>
                {trendInfo.displayText}
                <Minus className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
