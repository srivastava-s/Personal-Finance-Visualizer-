import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Budget from '@/models/Budget'
import Transaction from '@/models/Transaction'
import Category from '@/models/Category'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const includeSpending = searchParams.get('includeSpending') === 'true'
    const month = searchParams.get('month') // Format: YYYY-MM
    
    let startDate: Date
    let endDate: Date
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      startDate = new Date(year, monthNum - 1, 1)
      endDate = new Date(year, monthNum, 1)
    } else {
      // Current month
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
    
    // Get budgets for the specified period
    const budgets = await Budget.find({
      startDate: { $lte: endDate },
      $or: [
        { endDate: { $gte: startDate } },
        { endDate: { $exists: false } }
      ],
      isActive: true
    }).populate('category')
    
    if (includeSpending) {
      // Get actual spending for each budget category
      const budgetWithSpending = await Promise.all(
        budgets.map(async (budget) => {
          const spending = await Transaction.aggregate([
            {
              $match: {
                categoryId: budget.categoryId,
                type: 'expense',
                date: { $gte: startDate, $lt: endDate }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ])
          
          const actualSpending = spending.length > 0 ? spending[0].total : 0
          const transactionCount = spending.length > 0 ? spending[0].count : 0
          const remaining = budget.amount - actualSpending
          const percentage = budget.amount > 0 ? (actualSpending / budget.amount) * 100 : 0
          
          return {
            ...budget.toObject(),
            actualSpending,
            remaining,
            percentage: Math.round(percentage * 100) / 100,
            transactionCount,
            status: actualSpending > budget.amount ? 'over' : 
                   percentage > 80 ? 'warning' : 'good'
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        data: budgetWithSpending
      })
    }
    
    return NextResponse.json({
      success: true,
      data: budgets
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { categoryId, amount, period, startDate, endDate } = body
    
    // Validate required fields
    if (!categoryId || !amount || !period) {
      return NextResponse.json(
        { success: false, error: 'Category, amount, and period are required' },
        { status: 400 }
      )
    }
    
    // Validate period
    if (!['monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { success: false, error: 'Period must be either monthly or yearly' },
        { status: 400 }
      )
    }
    
    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Check if category exists and is expense type
    const category = await Category.findById(categoryId)
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    if (category.type !== 'expense') {
      return NextResponse.json(
        { success: false, error: 'Budgets can only be set for expense categories' },
        { status: 400 }
      )
    }
    
    // Check for existing budget for this category in the same period
    const existingBudget = await Budget.findOne({
      categoryId,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    })
    
    if (existingBudget) {
      return NextResponse.json(
        { success: false, error: 'A budget already exists for this category' },
        { status: 400 }
      )
    }
    
    const budget = new Budget({
      categoryId,
      amount,
      period,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined
    })
    
    await budget.save()
    
    const populatedBudget = await Budget.findById(budget._id).populate('category')
    
    return NextResponse.json({
      success: true,
      data: populatedBudget
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create budget' },
      { status: 500 }
    )
  }
} 