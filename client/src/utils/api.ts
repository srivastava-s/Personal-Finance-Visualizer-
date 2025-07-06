import axios from 'axios';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  FinancialSummary,
  MonthlySummary,
  YearlySummary,
  ChartData,
  TransactionFilters
} from '../types';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Transaction API functions
export const transactionApi = {
  // Get all transactions with optional filters
  getAll: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // Get transaction by ID
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Update transaction
  update: async (id: number, data: UpdateTransactionRequest): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getAll: async (type?: 'income' | 'expense'): Promise<Category[]> => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/categories${params}`);
    return response.data;
  },

  // Get category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Summary API functions
export const summaryApi = {
  // Get financial summary
  getSummary: async (startDate?: string, endDate?: string): Promise<FinancialSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/summary?${params.toString()}`);
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
    const response = await api.get(`/summary/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  // Get yearly summary
  getYearlySummary: async (year: number): Promise<YearlySummary> => {
    const response = await api.get(`/summary/yearly?year=${year}`);
    return response.data;
  },
};

// Charts API functions
export const chartsApi = {
  // Get spending by category chart data
  getSpendingByCategory: async (
    startDate?: string, 
    endDate?: string, 
    limit?: number
  ): Promise<ChartData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/charts/spending-by-category?${params.toString()}`);
    return response.data;
  },

  // Get income vs expenses chart data
  getIncomeVsExpenses: async (
    startDate?: string, 
    endDate?: string, 
    groupBy: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ChartData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('group_by', groupBy);
    
    const response = await api.get(`/charts/income-vs-expenses?${params.toString()}`);
    return response.data;
  },

  // Get monthly trend chart data
  getMonthlyTrend: async (year: number): Promise<ChartData> => {
    const response = await api.get(`/charts/monthly-trend?year=${year}`);
    return response.data;
  },

  // Get daily pattern chart data
  getDailyPattern: async (startDate?: string, endDate?: string): Promise<ChartData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/charts/daily-pattern?${params.toString()}`);
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 500) {
    return 'Internal server error';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout';
  }
  return error.message || 'An unexpected error occurred';
};

// Date utilities for API
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentMonthRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

export const getCurrentYearRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);
  
  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

export default api; 