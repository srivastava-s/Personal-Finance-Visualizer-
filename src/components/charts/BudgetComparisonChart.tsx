"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface BudgetComparisonData {
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  actualSpending: number
  remaining: number
  percentage: number
  status: 'good' | 'warning' | 'over'
}

interface BudgetComparisonChartProps {
  data: BudgetComparisonData[]
  title?: string
  description?: string
  className?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const budgetData = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{budgetData.categoryIcon}</span>
          <span className="font-semibold">{budgetData.categoryName}</span>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            Budget: <span className="font-semibold">{formatCurrency(budgetData.budgetAmount)}</span>
          </p>
          <p className="text-gray-600">
            Spent: <span className="font-semibold">{formatCurrency(budgetData.actualSpending)}</span>
          </p>
          <p className="text-gray-600">
            Remaining: <span className="font-semibold">{formatCurrency(budgetData.remaining)}</span>
          </p>
          <p className="text-gray-600">
            Used: <span className="font-semibold">{budgetData.percentage}%</span>
          </p>
          <div className="mt-2">
            <Badge 
              variant={
                budgetData.status === 'over' ? 'destructive' : 
                budgetData.status === 'warning' ? 'secondary' : 'default'
              }
            >
              {budgetData.status === 'over' ? 'Over Budget' : 
               budgetData.status === 'warning' ? 'Warning' : 'On Track'}
            </Badge>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function BudgetComparisonChart({ 
  data, 
  title = "Budget vs Actual", 
  description = "Compare your budgeted amounts with actual spending",
  className = "" 
}: BudgetComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No budget data available</p>
              <p className="text-sm text-muted-foreground">
                Set up budgets for your expense categories to see comparisons
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData = data.map(item => ({
    name: item.categoryName,
    icon: item.categoryIcon,
    color: item.categoryColor,
    budget: item.budgetAmount,
    actual: item.actualSpending,
    remaining: item.remaining,
    percentage: item.percentage,
    status: item.status
  }))

  // Calculate summary statistics
  const totalBudget = data.reduce((sum, item) => sum + item.budgetAmount, 0)
  const totalSpent = data.reduce((sum, item) => sum + item.actualSpending, 0)
  const totalRemaining = data.reduce((sum, item) => sum + item.remaining, 0)
  const overBudgetCount = data.filter(item => item.status === 'over').length
  const warningCount = data.filter(item => item.status === 'warning').length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar 
                dataKey="budget" 
                fill="#3B82F6" 
                name="Budget"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                fill="#EF4444" 
                name="Actual"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Budget</p>
              <p className="font-semibold text-blue-600">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Spent</p>
              <p className="font-semibold text-red-600">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className={`font-semibold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="flex space-x-1">
                {overBudgetCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overBudgetCount} Over
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {warningCount} Warning
                  </Badge>
                )}
                {overBudgetCount === 0 && warningCount === 0 && (
                  <Badge variant="default" className="text-xs">
                    All Good
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 