"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
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
import { format } from "date-fns";
import { getTrendInfo, type TrendDirection } from "@/lib/trend-utils";

interface ChartLineLinearProps {
  chartData: Array<Record<string, string | number>>;
  title: string;
  description?: string;
  trendDirection?: TrendDirection;
  trendChange?: number;
  trendLabel?: string;
  dataKey: string;
  metricLabel?: string;
  color?: string;
}

export function ChartLineLinear({
  chartData,
  title,
  trendDirection,
  trendChange,
  trendLabel,
  dataKey,
  metricLabel,
  color = "var(--chart-1"
}: ChartLineLinearProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="created_at"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), "LLL dd")}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey={dataKey}
              type="linear"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
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
