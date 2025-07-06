import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { summaryApi } from '../utils/api';
import { FinancialSummary, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await summaryApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      toast.error('Failed to load financial summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { summary: financialSummary, top_categories, recent_transactions } = summary;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your financial activity
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="stat-label">Total Income</p>
              <p className="stat-value text-success-600">
                {formatCurrency(financialSummary.total_income)}
              </p>
              <p className="stat-change-positive">
                {financialSummary.income_count} transactions
              </p>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value text-danger-600">
                {formatCurrency(financialSummary.total_expenses)}
              </p>
              <p className="stat-change-negative">
                {financialSummary.expense_count} transactions
              </p>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="stat-label">Net Income</p>
              <p className={`stat-value ${
                financialSummary.net_income >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(financialSummary.net_income)}
              </p>
              <p className={`stat-change ${
                financialSummary.net_income >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {financialSummary.net_income >= 0 ? 'Positive' : 'Negative'} balance
              </p>
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="stat-label">Total Transactions</p>
              <p className="stat-value">
                {financialSummary.income_count + financialSummary.expense_count}
              </p>
              <p className="stat-change text-gray-500">
                This period
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Spending Categories */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top Spending Categories</h3>
          </div>
          <div className="card-body">
            {top_categories.length > 0 ? (
              <div className="space-y-4">
                {top_categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{category.category_icon}</span>
                      <span className="font-medium text-gray-900">
                        {category.category_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(category.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {category.percentage}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No spending data available</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="card-body">
            {recent_transactions.length > 0 ? (
              <div className="space-y-4">
                {recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {transaction.category_icon || '💰'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category_name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 