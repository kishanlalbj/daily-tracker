import type { TrendDirection } from "@/lib/trend-utils";

export enum Provider {
  LOCAL = "local",
  GOOGLE = "google"
}

export enum GENDER {
  MALE = "male",
  FEMALE = "female"
}

export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  height?: number;
  password?: string;
  gender?: GENDER;
  avatar?: string;
  created_at?: Date;
  last_login_at?: Date;
  provider?: Provider;
}

export interface Expense {
  id?: number;
  date: string;
  expense_title: string;
  amount: number;
  categoryId?: number;
  userId?: number;
  category: {
    title: string;
  };
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
};
