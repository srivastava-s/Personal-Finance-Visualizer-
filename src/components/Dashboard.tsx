"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock data for demonstration
const mockSummary = {
  totalIncome: 8500,
  totalExpenses: 3200,
  netIncome: 5300,
  incomeCount: 3,
  expenseCount: 12
}

const mockTopCategories = [
  { name: 'Food & Dining', amount: 800, color: '#ef4444', icon: '🍽️' },
  { name: 'Transportation', amount: 600, color: '#06b6d4', icon: '🚗' },
  { name: 'Shopping', amount: 500, color: '#ec4899', icon: '🛍️' },
  { name: 'Entertainment', amount: 400, color: '#f97316', icon: '🎬' },
  { name: 'Utilities', amount: 300, color: '#6366f1', icon: '⚡' }
]

const mockRecentTransactions = [
  { id: 1, description: 'Monthly Salary', amount: 5000, type: 'income', date: '2024-01-15', category: 'Salary' },
  { id: 2, description: 'Grocery Shopping', amount: 150, type: 'expense', date: '2024-01-16', category: 'Food & Dining' },
  { id: 3, description: 'Gas Station', amount: 45, type: 'expense', date: '2024-01-17', category: 'Transportation' },
  { id: 4, description: 'Freelance Project', amount: 800, type: 'income', date: '2024-01-18', category: 'Freelance' },
  { id: 5, description: 'Movie Tickets', amount: 25, type: 'expense', date: '2024-01-19', category: 'Entertainment' }
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockSummary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockSummary.incomeCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(mockSummary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockSummary.expenseCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${mockSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(mockSummary.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockSummary.netIncome >= 0 ? 'Positive' : 'Negative'} balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSummary.incomeCount + mockSummary.expenseCount}
            </div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((category.amount / mockSummary.totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Analytics</CardTitle>
          <CardDescription>Interactive charts and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Charts coming soon!</p>
              <p className="text-sm text-muted-foreground">
                Recharts integration for beautiful data visualization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 