"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface SpendingInsight {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalSpent: number
  transactionCount: number
  averageAmount: number
  maxAmount: number
  minAmount: number
}

interface BudgetComparison {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  actualSpending: number
  remaining: number
  percentage: number
  status: 'good' | 'warning' | 'over'
}

interface TrendData {
  month: string
  total: number
}

interface InsightsData {
  period: string
  summary: {
    totalSpending: number
    totalTransactions: number
    averageTransaction: number
    totalIncome: number
    savingsRate: number
  }
  spendingInsights: SpendingInsight[]
  budgetComparison: BudgetComparison[]
  trendData: TrendData[]
  topCategory: SpendingInsight | null
  overBudgetCategories: number
  insights: {
    topSpendingCategory: string
    averageDailySpending: number
    budgetUtilization: number
    overBudgetCount: number
  }
}

export default function Insights() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const { toast } = useToast()

  useEffect(() => {
    fetchInsights()
  }, [period])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/insights?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch insights",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch insights",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'negative':
        return <TrendingUp className="h-5 w-5 text-red-600" />
      default:
        return <Target className="h-5 w-5 text-blue-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground">
              Smart analysis of your spending patterns
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground">
              Smart analysis of your spending patterns
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No data available</p>
              <p className="text-sm text-muted-foreground">
                Add some transactions to see spending insights
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
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            Smart analysis of your spending patterns for the last {period}
          </p>
        </div>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalSpending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.summary.averageTransaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Spending</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.insights.averageDailySpending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.summary.savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of total income
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
              {data.spendingInsights.slice(0, 5).map((insight, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{insight.categoryIcon}</span>
                    <div>
                      <p className="font-medium">{insight.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(insight.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(insight.averageAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Performance</CardTitle>
            <CardDescription>How you're tracking against your budgets</CardDescription>
          </CardHeader>
          <CardContent>
            {data.budgetComparison.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No budgets set</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Set up budgets to track performance
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.budgetComparison.map((budget, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{budget.categoryIcon}</span>
                      <div>
                        <p className="font-medium">{budget.categoryName}</p>
                        <p className="text-xs text-muted-foreground">
                          {budget.percentage}% used
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(budget.actualSpending)}</p>
                      <p className="text-xs text-muted-foreground">
                        / {formatCurrency(budget.budgetAmount)}
                      </p>
                      <Badge 
                        variant={
                          budget.status === 'over' ? 'destructive' : 
                          budget.status === 'warning' ? 'secondary' : 'default'
                        }
                        className="mt-1"
                      >
                        {budget.status === 'over' ? 'Over' : 
                         budget.status === 'warning' ? 'Warning' : 'Good'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Insights</CardTitle>
          <CardDescription>Actionable recommendations based on your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold">Spending Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.topCategory ? 'negative' : 'positive')}
                  <div>
                    <p className="font-medium">Top Spending Category</p>
                    <p className="text-sm text-muted-foreground">
                      {data.insights.topSpendingCategory} is your highest expense category
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.insights.averageDailySpending > 100 ? 'warning' : 'positive')}
                  <div>
                    <p className="font-medium">Daily Spending</p>
                    <p className="text-sm text-muted-foreground">
                      You spend an average of {formatCurrency(data.insights.averageDailySpending)} per day
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.summary.savingsRate > 20 ? 'positive' : 'warning')}
                  <div>
                    <p className="font-medium">Savings Rate</p>
                    <p className="text-sm text-muted-foreground">
                      You're saving {data.summary.savingsRate}% of your income
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Insights */}
            <div className="space-y-4">
              <h3 className="font-semibold">Budget Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.insights.budgetUtilization > 80 ? 'warning' : 'positive')}
                  <div>
                    <p className="font-medium">Budget Utilization</p>
                    <p className="text-sm text-muted-foreground">
                      You're using {data.insights.budgetUtilization}% of your total budget
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.insights.overBudgetCount > 0 ? 'negative' : 'positive')}
                  <div>
                    <p className="font-medium">Over Budget Categories</p>
                    <p className="text-sm text-muted-foreground">
                      {data.insights.overBudgetCount} categories are over budget
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  {getInsightIcon(data.summary.averageTransaction > 100 ? 'warning' : 'positive')}
                  <div>
                    <p className="font-medium">Transaction Size</p>
                    <p className="text-sm text-muted-foreground">
                      Average transaction is {formatCurrency(data.summary.averageTransaction)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 