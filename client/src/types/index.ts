// Transaction types
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id?: number;
  date: string;
  notes?: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {
  id: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

// Summary types
export interface FinancialSummary {
  summary: {
    total_income: number;
    total_expenses: number;
    net_income: number;
    income_count: number;
    expense_count: number;
  };
  top_categories: TopCategory[];
  recent_transactions: Transaction[];
}

export interface TopCategory {
  category_name: string;
  category_color: string;
  category_icon: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_income: number;
  daily_data: DailyData[];
}

export interface DailyData {
  day: string;
  total_income: number;
  total_expenses: number;
  income_count: number;
  expense_count: number;
  daily_income: number;
  daily_expenses: number;
}

export interface YearlySummary {
  year: number;
  total_income: number;
  total_expenses: number;
  net_income: number;
  monthly_data: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  total_income: number;
  total_expenses: number;
  income_count: number;
  expense_count: number;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  raw_data?: any[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  type?: string;
}

export interface SpendingByCategoryData extends ChartData {
  raw_data: TopCategory[];
}

export interface IncomeVsExpensesData extends ChartData {
  raw_data: {
    period: string;
    income: number;
    expenses: number;
  }[];
}

export interface MonthlyTrendData extends ChartData {
  raw_data: {
    month: string;
    income: number;
    expenses: number;
    net_income: number;
  }[];
}

export interface DailyPatternData extends ChartData {
  raw_data: {
    day_of_week: string;
    income: number;
    expenses: number;
    income_count: number;
    expense_count: number;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface TransactionFilters {
  type?: 'income' | 'expense';
  category_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

// Form types
export interface TransactionFormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  notes: string;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

// UI State types
export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  summary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
}

export interface ModalState {
  isOpen: boolean;
  type: 'transaction' | 'category' | null;
  data?: Transaction | Category;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

// Utility types
export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';
export type ChartType = 'pie' | 'bar' | 'line' | 'doughnut';

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
}

// Settings types
export interface UserSettings {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

// Budget types
export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface CreateBudgetRequest {
  category_id: number;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
}

export interface UpdateBudgetRequest extends CreateBudgetRequest {
  id: number;
} 