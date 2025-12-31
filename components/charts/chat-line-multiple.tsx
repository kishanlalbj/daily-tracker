"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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

export const description = "A multiple line chart";

const chartConfig = {
  bmi: {
    label: "Body Mass Index",
    color: "var(--chart-3)"
  },
  bodyFat: {
    label: "Body Fat %",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

export function ChartLineMultiple({ chartData = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="bmi"
              type="monotone"
              stroke="var(--color-bmi)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="bodyFat"
              type="monotone"
              stroke="var(--color-bodyFat)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
