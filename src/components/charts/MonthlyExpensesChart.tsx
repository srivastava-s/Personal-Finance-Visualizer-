"use client"

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ITransaction } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface MonthlyExpensesChartProps {
  transactions: ITransaction[]
}

interface ChartData {
  month: string
  expenses: number
  income: number
}

export default function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { expenses: number; income: number } } = {}

    // Group transactions by month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { expenses: 0, income: 0 }
      }

      if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += transaction.amount
      } else {
        monthlyData[monthKey].income += transaction.amount
      }
    })

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          expenses: data.expenses,
          income: data.income,
          sortKey: key
        }
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6) // Show last 6 months
      .map(({ month, expenses, income }) => ({ month, expenses, income }))
  }, [transactions])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No data available</p>
          <p className="text-sm text-muted-foreground">
            Add some transactions to see your monthly trends
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatCurrency(value), 
              name === 'expenses' ? 'Expenses' : 'Income'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar 
            dataKey="expenses" 
            fill="#ef4444" 
            name="Expenses"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            name="Income"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 