// MongoDB/Mongoose types
export interface ICategory {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  category?: ICategory;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget {
  _id: string;
  categoryId: string;
  category?: ICategory;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface CreateTransactionRequest {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
  notes?: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {
  id: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: string;
}

// Summary and Analytics types
export interface FinancialSummary {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    incomeCount: number;
    expenseCount: number;
  };
  topCategories: TopCategory[];
  recentTransactions: ITransaction[];
}

export interface TopCategory {
  category: ICategory;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  dailyData: DailyData[];
}

export interface DailyData {
  day: string;
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  dailyIncome: number;
  dailyExpenses: number;
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyData: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
}

// Chart types for Recharts
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface LineChartData {
  date: string;
  income: number;
  expenses: number;
  netIncome: number;
}

export interface BarChartData {
  category: string;
  amount: number;
  color: string;
}

export interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

// Form types
export interface TransactionFormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
  notes: string;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

// Filter types
export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// UI State types
export interface AppState {
  transactions: ITransaction[];
  categories: ICategory[];
  summary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
}

export interface ModalState {
  isOpen: boolean;
  type: 'transaction' | 'category' | null;
  data?: ITransaction | ICategory;
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

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Settings types
export interface UserSettings {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  notifications: boolean;
} 