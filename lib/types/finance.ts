// Finance Module Types

export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash"
  | "investment"
  | "loan"
  | "other";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution?: string;
  last_four?: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  is_transfer: boolean;
  transfer_pair_id?: string;
  recurring_rule_id?: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: Category;
  account?: Account;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  parent_id?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetPeriod = "weekly" | "biweekly" | "monthly" | "yearly";

export interface Budget {
  id: string;
  profile_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  rollover: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined/computed
  category?: Category;
  spent?: number;
  remaining?: number;
  percentUsed?: number;
}

export type GoalType =
  | "revenue"
  | "profit"
  | "valuation"
  | "runway"
  | "revenue_multiple";

export interface Goal {
  id: string;
  profile_id: string;
  type: GoalType;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date?: string;
  notes?: string;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  next_renewal_date: string;
  last_charge_date?: string;
  category_id?: string;
  is_active: boolean;
  is_auto_detected: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
}

// Analytics types
export interface AnalyticsOverview {
  currentMonth: {
    income: number;
    expenses: number;
    profit: number;
  };
  lastMonth: {
    income: number;
    expenses: number;
    profit: number;
  };
  changes: {
    income: number;
    expenses: number;
    profit: number;
  };
  totalBalance: number;
}

export interface AccountTotals {
  assets: number;
  liabilities: number;
  netWorth: number;
}

// Color constants for account types
export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: "#3b82f6",
  savings: "#22c55e",
  credit_card: "#ef4444",
  cash: "#10b981",
  investment: "#8b5cf6",
  loan: "#f97316",
  other: "#6b7280",
};

// Color constants for budget progress
export const getBudgetProgressColor = (percentUsed: number): string => {
  if (percentUsed > 100) return "#ef4444"; // red - over budget
  if (percentUsed >= 80) return "#f59e0b"; // amber - caution
  if (percentUsed >= 50) return "#0ea5e9"; // blue - warning
  return "#22c55e"; // green - on track
};

// Transaction amount helpers
export const isIncome = (amount: number): boolean => amount > 0;
export const isExpense = (amount: number): boolean => amount < 0;

export const getTransactionColor = (amount: number): string => {
  if (amount > 0) return "#22c55e"; // green for income
  if (amount < 0) return "#ef4444"; // red for expense
  return "#6b7280"; // gray for zero/transfer
};
