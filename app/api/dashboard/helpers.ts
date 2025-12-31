// Helper function to calculate trends
export const calculateTrend = (
  data: Record<string, unknown>[],
  field: string
): { direction: "up" | "down" | "stable"; change: number } => {
  if (data.length < 2) return { direction: "stable", change: 0 };

  const latest = Number(data[data.length - 1][field]);
  const earliest = Number(data[0][field]);
  const change = Number(((latest - earliest) / earliest) * 100).toFixed(2);

  let direction: "up" | "down" | "stable" = "stable";
  if (latest > earliest + earliest * 0.01) direction = "up";
  else if (latest < earliest - earliest * 0.01) direction = "down";

  return { direction, change: Number(change) };
};

// Helper function to generate date range
export const getDateRange = (searchParams: URLSearchParams) => {
  let fromDate: Date;
  let toDate: Date;

  if (searchParams.get("startDate")) {
    fromDate = new Date(searchParams.get("startDate")!);
  } else {
    fromDate = new Date();
    fromDate.setDate(1);
    fromDate.setHours(0, 0, 0, 0);
  }

  if (searchParams.get("endDate")) {
    toDate = new Date(searchParams.get("endDate")!);
  } else {
    toDate = new Date(fromDate);
    toDate.setMonth(fromDate.getMonth() + 1);
  }

  return { fromDate, toDate };
};

// Helper function to calculate daily expenses
export const getDailyExpenses = (
  allExpenses: { date: Date; amount: number | { toNumber: () => number } }[],
  fromDate: Date,
  toDate: Date
) => {
  const dailyExpensesMap = new Map<string, number>();

  allExpenses.forEach((expense) => {
    const dateKey = expense.date.toISOString().split("T")[0];
    const currentTotal = dailyExpensesMap.get(dateKey) || 0;
    const amount =
      typeof expense.amount === "number"
        ? expense.amount
        : expense.amount.toNumber();
    dailyExpensesMap.set(dateKey, currentTotal + amount);
  });

  const dailyExpenses = [];
  const currentDate = new Date(fromDate);

  while (currentDate < toDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    dailyExpenses.push({
      created_at: new Date(currentDate),
      total: dailyExpensesMap.get(dateKey) || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyExpenses;
};

// Helper function to calculate body composition changes
export const getBodyComposition = (
  weightDirection: "up" | "down" | "stable",
  bodyFatDirection: "up" | "down" | "stable"
) => {
  let bodyComposition = {
    message: "Insufficient data",
    color: "text-muted-foreground"
  };

  if (weightDirection && bodyFatDirection) {
    if (weightDirection === "down") {
      if (bodyFatDirection === "down") {
        bodyComposition = {
          message: "Losing fat",
          color: "text-green-500"
        };
      } else if (bodyFatDirection === "up") {
        bodyComposition = {
          message: "Losing muscle",
          color: "text-red-500"
        };
      } else {
        bodyComposition = {
          message: "Weight loss",
          color: "text-blue-500"
        };
      }
    } else if (weightDirection === "up") {
      if (bodyFatDirection === "down") {
        bodyComposition = {
          message: "Gaining muscle",
          color: "text-green-500"
        };
      } else if (bodyFatDirection === "up") {
        bodyComposition = {
          message: "Gaining fat",
          color: "text-orange-500"
        };
      } else {
        bodyComposition = {
          message: "Weight gain",
          color: "text-blue-500"
        };
      }
    } else {
      if (bodyFatDirection === "down") {
        bodyComposition = {
          message: "Body recomposition",
          color: "text-green-500"
        };
      } else if (bodyFatDirection === "up") {
        bodyComposition = {
          message: "Fat increase",
          color: "text-orange-500"
        };
      } else {
        bodyComposition = {
          message: "Maintaining weight",
          color: "text-blue-500"
        };
      }
    }
  }

  return bodyComposition;
};

// Helper function to calculate ideal weight based on BMI
export const calculateIdealWeight = (
  heightInMeters: number,
  gender: "male" | "female" | "other" | "unknown"
) => {
  // Using BMI of 22 as ideal (middle of healthy range 18.5-24.9)
  const idealBMI = gender === "female" ? 21 : 22.5;
  const idealWeight = idealBMI * Math.pow(heightInMeters, 2);
  return Number(idealWeight.toFixed(1));
};

// Helper function to calculate weight goal
export const calculateWeightGoal = (
  currentWeight: number,
  idealWeight: number
) => {
  const difference = currentWeight - idealWeight;
  const absDifference = Math.abs(difference);

  if (absDifference < 1) {
    return {
      message: "At ideal weight",
      difference: 0,
      color: "text-green-500"
    };
  }

  if (difference > 0) {
    return {
      message: `${absDifference.toFixed(1)} kg to lose`,
      difference: -absDifference,
      color: "text-orange-500"
    };
  }

  return {
    message: `${absDifference.toFixed(1)} kg to gain`,
    difference: absDifference,
    color: "text-blue-500"
  };
};
