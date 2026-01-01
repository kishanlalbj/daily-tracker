import { getTrendInfo, type TrendDirection } from "./trend-utils";

export const calculateTrendFromData = (
  direction?: TrendDirection,
  change?: number
) => {
  if (direction === undefined || change === undefined) return null;
  return getTrendInfo(direction, change);
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatCurrency = (amount?: number | null): string => {
  if (amount == null || Number.isNaN(amount)) return "–";
  return currencyFormatter.format(amount);
};

export const formatNumber = (
  value?: number | null,
  decimals: number = 2
): string => {
  if (value == null) return "-";
  return value.toFixed(decimals);
};

export const formatPercentage = (value?: number | null): string => {
  if (value == null) return "-";
  return `${value.toFixed(2)} %`;
};

export const getBMICategory = (
  bmi?: number | null
): {
  category: string;
  color: string;
} => {
  if (bmi == null) {
    return { category: "-", color: "text-muted-foreground" };
  }

  if (bmi < 18.5) {
    return { category: "Underweight", color: "text-yellow-500" };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: "Normal", color: "text-green-500" };
  } else if (bmi >= 25 && bmi < 30) {
    return { category: "Overweight", color: "text-orange-500" };
  } else {
    return { category: "Obese", color: "text-red-500" };
  }
};
