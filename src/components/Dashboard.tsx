"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, RefreshCw, Target, Tag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import BudgetComparisonChart from '@/components/charts/BudgetComparisonChart'
import { useToast } from '@/hooks/use-toast'

interface DashboardData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    incomeCount: number
    expenseCount: number
    totalTransactions: number
  }
  categoryBreakdown: Array<{
    _id: string
    name: string
    color: string
    icon: string
    amount: number
    count: number
  }>
  topCategories: Array<{
    _id: string
    name: string
    color: string
    icon: string
    amount: number
    count: number
  }>
  recentTransactions: Array<{
    _id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
    category: {
      name: string
      icon: string
    }
  }>
  period: string
}

interface BudgetData {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  actualSpending: number
  remaining: number
  percentage: number
  status: 'good' | 'warning' | 'over'
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
    fetchBudgetData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch dashboard data",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgetData = async () => {
    try {
      const response = await fetch(`/api/budgets?includeSpending=true&month=${new Date().toISOString().slice(0, 7)}`)
      const result = await response.json()
      
      if (result.success) {
        setBudgetData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch budget data:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your financial activity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center h-24">
                <div className="text-muted-foreground">Loading...</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your financial activity
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No data available</p>
              <p className="text-sm text-muted-foreground">
                Add some transactions to see your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial activity for the last {period}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.incomeCount} transactions
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
              {formatCurrency(data.summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.expenseCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.summary.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.netIncome >= 0 ? 'Positive' : 'Negative'} balance
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
              {data.summary.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              This {period}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <CategoryPieChart 
          data={data.categoryBreakdown}
          title="Expense Breakdown"
          description="Distribution of expenses by category"
        />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{transaction.category.icon}</span>
                      <div className="flex flex-col">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} • {transaction.category.name}
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
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Chart */}
      {budgetData.length > 0 && (
        <BudgetComparisonChart 
          data={budgetData}
          title="Budget vs Actual Spending"
          description="Compare your budgeted amounts with actual spending this month"
        />
      )}

      {/* Top Spending Categories */}
      {data.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCategories.map((category) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((category.amount / data.summary.totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Add Transaction</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Tag className="h-6 w-6" />
              <span className="text-sm">Manage Categories</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span className="text-sm">Set Budgets</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 