import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Transaction from '@/models/Transaction'
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
    
    // Get transactions for the period
    const transactions = await Transaction.find({
      date: { $gte: startDate, $lte: now }
    }).populate('category').sort({ date: -1 })
    
    // Calculate summary statistics
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses
    
    // Get category breakdown for expenses
    const categoryBreakdown = await Transaction.aggregate([
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
          name: { $first: '$category.name' },
          color: { $first: '$category.color' },
          icon: { $first: '$category.icon' },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ])
    
    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({})
      .populate('category')
      .sort({ date: -1 })
      .limit(10)
    
    // Get top spending categories (top 5)
    const topCategories = categoryBreakdown.slice(0, 5)
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netIncome,
          incomeCount: incomeTransactions.length,
          expenseCount: expenseTransactions.length,
          totalTransactions: transactions.length
        },
        categoryBreakdown,
        topCategories,
        recentTransactions,
        period
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 