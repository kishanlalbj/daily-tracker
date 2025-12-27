import { getTrendInfo, type TrendDirection } from "./trend-utils";

// Helper to calculate trend info from dashboard data
export const calculateTrendFromData = (
  direction?: TrendDirection,
  change?: number
) => {
  if (direction === undefined || change === undefined) return null;
  return getTrendInfo(direction, change);
};

// Helper to format currency
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "-";
  return `₹ ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Helper to format number with decimals
export const formatNumber = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined) return "-";
  return Number(value).toFixed(decimals);
};

// Helper to format percentage
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toFixed(2)} %`;
};

// Helper to get BMI category and color
export const getBMICategory = (
  bmi: number | null | undefined
): {
  category: string;
  color: string;
} => {
  if (bmi === null || bmi === undefined) {
    return { category: "-", color: "text-muted-foreground" };
  }

  const bmiValue = Number(bmi);

  if (bmiValue < 18.5) {
    return { category: "Underweight", color: "text-yellow-500" };
  } else if (bmiValue >= 18.5 && bmiValue < 25) {
    return { category: "Normal", color: "text-green-500" };
  } else if (bmiValue >= 25 && bmiValue < 30) {
    return { category: "Overweight", color: "text-orange-500" };
  } else {
    return { category: "Obese", color: "text-red-500" };
  }
};
