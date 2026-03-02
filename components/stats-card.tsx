import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface StatsCardTrend {
  direction: "up" | "down" | "stable";
  change: number;
  isPositiveGood?: boolean;
}

interface StatsCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  value: string | number | React.ReactNode;
  icon?: React.ElementType;
  trend?: StatsCardTrend;
}

const StatsCard = ({
  title,
  subtitle,
  value,
  icon: Icon,
  trend
}: StatsCardProps) => {
  let trendColorClass = "text-muted-foreground";
  let TrendIcon: React.ElementType = MinusIcon;

  if (trend) {
    const positiveGood = trend.isPositiveGood !== false;
    const isGood =
      trend.direction === "stable"
        ? false
        : positiveGood
          ? trend.direction === "up"
          : trend.direction === "down";

    if (trend.direction === "stable") {
      trendColorClass = "text-muted-foreground";
      TrendIcon = MinusIcon;
    } else if (isGood) {
      trendColorClass = "text-emerald-500";
      TrendIcon = TrendingUpIcon;
    } else {
      trendColorClass = "text-red-500";
      TrendIcon = TrendingDownIcon;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            {title}
          </p>
          {Icon && (
            <div className="h-8 w-8 shrink-0 rounded-md bg-muted flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold font-mono tabular-nums">{value}</p>
        <div className="flex items-center justify-between mt-1 gap-2 min-h-5">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trend.direction !== "stable" && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium shrink-0",
                trendColorClass
              )}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {Math.abs(trend.change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
