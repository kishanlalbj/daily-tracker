import { type TrendDirection } from "@/lib/trend-utils";
import type { Frequency } from "@/lib/recurring-utils";

export enum GENDER {
  MALE = "male",
  FEMALE = "female"
}

export interface User {
  id?: string | number;
  first_name: string;
  last_name: string;
  email: string;
  height?: number;
  password?: string;
  gender?: GENDER;
  avatar?: string;
  created_at?: Date;
  last_login_at?: Date;
}

export interface Expense {
  id?: string | number;
  date: string;
  expense_title: string;
  amount: number;
  categoryId?: number;
  category: {
    title: string;
  };
}

export interface RecurringExpense {
  id: number;
  expense_title: string;
  amount: number;
  frequency: Frequency;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  last_run_date: string | null;
  is_active: boolean;
  categoryId: number;
  category: { title: string };
  created_at: string;
}

export type IncomeSource = "salary" | "freelance" | "rental" | "business" | "other";
export type AssetType = "cash" | "property" | "stocks" | "vehicle" | "other";
export type LiabilityType = "loan" | "credit_card" | "mortgage" | "other";

export interface RecurringIncome {
  id: number;
  title: string;
  amount: number;
  source: IncomeSource;
  frequency: Frequency;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  last_run_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Income {
  id: number;
  date: string;
  title: string;
  amount: number;
  source: IncomeSource;
  recurringIncomeId: number | null;
  created_at: string;
}

export interface BudgetLimit {
  id: number;
  categoryId: number;
  category: { id: number; title: string };
  amount: number;
  created_at: string;
}

export interface FinancialGoal {
  id: number;
  title: string;
  target_amount: number;
  target_date: string;
  is_achieved: boolean;
  created_at: string;
}

export interface Asset {
  id: number;
  title: string;
  value: number;
  type: AssetType;
  date: string;
  created_at: string;
}

export interface Liability {
  id: number;
  title: string;
  amount: number;
  type: LiabilityType;
  created_at: string;
}

export type GlucoseMeasurementType = "fasting" | "post_meal" | "random" | "bedtime";
export type BPClassification =
  | "Normal"
  | "Elevated"
  | "High Stage 1"
  | "High Stage 2"
  | "Hypertensive Crisis";
export type GlucoseClassification = "Normal" | "Prediabetes" | "Diabetes" | "Concern";

export interface BloodPressure {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export interface BloodGlucose {
  id: number;
  glucose_level: number;
  measurement_type: GlucoseMeasurementType;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export interface BPAverages {
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
}

export interface GlucoseAverages {
  fasting: number | null;
  post_meal: number | null;
  random: number | null;
  bedtime: number | null;
}

export interface Measurement {
  id?: string | number;
  created_at: string;
  weight: number;
  bmi: number;
  bodyFat: number;
  bodyFatWeight?: number;
}

export type DashboardData = {
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
    totalInvestments: number;
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
  income: {
    total: number;
    changeFromPreviousPeriod: number;
    direction: "up" | "down" | "stable";
  };
  netSavings: number;
  savingsRate: number;
};
