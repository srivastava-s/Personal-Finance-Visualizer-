"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  _id: string
  name: string
  color: string
  icon: string
  amount: number
  count: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
  title?: string
  description?: string
  className?: string
}

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#F43F5E', '#A855F7', '#06B6D4', '#059669', '#DC2626'
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{data.icon}</span>
          <span className="font-semibold">{data.name}</span>
        </div>
        <p className="text-sm text-gray-600">
          Amount: <span className="font-semibold">{formatCurrency(data.amount)}</span>
        </p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold">{data.count} transactions</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-semibold">{data.percentage}%</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CategoryPieChart({ 
  data, 
  title = "Category Breakdown", 
  description = "Expense distribution by category",
  className = "" 
}: CategoryPieChartProps) {
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
              <p className="text-muted-foreground mb-2">No data available</p>
              <p className="text-sm text-muted-foreground">
                Add some transactions to see category breakdown
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  // Add percentage to data
  const chartData = data.map(item => ({
    ...item,
    percentage: ((item.amount / total) * 100).toFixed(1)
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="font-semibold">{formatCurrency(total)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Categories</p>
              <p className="font-semibold">{data.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 