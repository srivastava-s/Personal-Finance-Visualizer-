import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Transaction from '@/models/Transaction'
import Budget from '@/models/Budget'
import Category from '@/models/Category'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year
    
    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    // Get spending insights
    const spendingInsights = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: '$category.name' },
          categoryIcon: { $first: '$category.icon' },
          categoryColor: { $first: '$category.color' },
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ])
    
    // Get budget vs actual comparison
    const budgets = await Budget.find({
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: startDate } },
        { endDate: { $exists: false } }
      ],
      isActive: true
    }).populate('category')
    
    const budgetComparison = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              categoryId: budget.categoryId,
              type: 'expense',
              date: { $gte: startDate, $lte: now }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ])
        
        const actualSpending = spending.length > 0 ? spending[0].total : 0
        const remaining = budget.amount - actualSpending
        const percentage = budget.amount > 0 ? (actualSpending / budget.amount) * 100 : 0
        
        return {
          budgetId: budget._id,
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          categoryColor: budget.category.color,
          budgetAmount: budget.amount,
          actualSpending,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          status: actualSpending > budget.amount ? 'over' : 
                 percentage > 80 ? 'warning' : 'good'
        }
      })
    )
    
    // Get spending trends (last 6 months)
    const trendData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthSpending = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            date: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
      
      trendData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: monthSpending.length > 0 ? monthSpending[0].total : 0
      })
    }
    
    // Calculate overall insights
    const totalSpending = spendingInsights.reduce((sum, item) => sum + item.totalSpent, 0)
    const totalTransactions = spendingInsights.reduce((sum, item) => sum + item.transactionCount, 0)
    const averageTransaction = totalTransactions > 0 ? totalSpending / totalTransactions : 0
    
    // Find top spending category
    const topCategory = spendingInsights.length > 0 ? spendingInsights[0] : null
    
    // Find categories over budget
    const overBudgetCategories = budgetComparison.filter(item => item.status === 'over')
    
    // Calculate savings rate (if we have income data)
    const incomeData = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    
    const totalIncome = incomeData.length > 0 ? incomeData[0].total : 0
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalSpending,
          totalTransactions,
          averageTransaction: Math.round(averageTransaction * 100) / 100,
          totalIncome,
          savingsRate: Math.round(savingsRate * 100) / 100
        },
        spendingInsights,
        budgetComparison,
        trendData,
        topCategory,
        overBudgetCategories: overBudgetCategories.length,
        insights: {
          topSpendingCategory: topCategory?.categoryName || 'None',
          averageDailySpending: Math.round((totalSpending / Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) * 100) / 100,
          budgetUtilization: budgetComparison.length > 0 ? 
            Math.round((budgetComparison.reduce((sum, item) => sum + item.percentage, 0) / budgetComparison.length) * 100) / 100 : 0,
          overBudgetCount: overBudgetCategories.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
} 