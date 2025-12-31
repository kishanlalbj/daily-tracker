"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart } from "recharts";
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

interface ChartPieDonutProps {
  chartData: Array<Record<string, string | number>>;
  title: string;
  description?: string;
  trendDirection?: TrendDirection;
  trendChange?: number;
  trendLabel?: string;
  dataKey: string;
  nameKey: string;
  metricLabel?: string;
  innerRadius?: number;
  className?: string;
}

export function ChartPieDonut({
  chartData,
  title,
  description,
  trendDirection,
  trendChange,
  trendLabel,
  dataKey,
  nameKey,
  metricLabel,
  innerRadius = 60,
  className
}: ChartPieDonutProps) {
  // Dynamically generate chart config and colors
  const chartConfig = chartData.reduce(
    (config, item, index) => {
      const key = String(item[nameKey]);
      const colorVar = `--chart-${(index % 5) + 1}`;
      return {
        ...config,
        [key]: {
          label: key,
          color: `var(${colorVar})`
        }
      };
    },
    {
      [dataKey]: {
        label: metricLabel || dataKey
      }
    } as ChartConfig
  );

  // Add fill color to chart data
  const dataWithFill = chartData.map((item, index) => ({
    ...item,
    fill: `var(--chart-${(index % 5) + 1})`
  }));

  const trendInfo =
    trendDirection && trendChange !== undefined
      ? getTrendInfo(trendDirection, trendChange)
      : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className={className || "mx-auto aspect-square max-h-[250px]"}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataWithFill}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {trendInfo && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
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
