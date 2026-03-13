"use client";

import { CartesianGrid, Line, LineChart, XAxis, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { format } from "date-fns";

interface LineConfig {
  dataKey: string;
  label: string;
  color: string;
}

interface ChartLineDualProps {
  chartData: Array<Record<string, string | number>>;
  title: string;
  description?: string;
  line1: LineConfig;
  line2: LineConfig;
  dateKey?: string;
}

export function ChartLineDual({
  chartData,
  title,
  description,
  line1,
  line2,
  dateKey = "measured_at"
}: ChartLineDualProps) {
  const chartConfig: ChartConfig = {
    [line1.dataKey]: { label: line1.label, color: line1.color },
    [line2.dataKey]: { label: line2.label, color: line2.color }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), "LLL dd")}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              dataKey={line1.dataKey}
              name={line1.label}
              type="linear"
              stroke={line1.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey={line2.dataKey}
              name={line2.label}
              type="linear"
              stroke={line2.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
