import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Transaction from '@/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    const query: any = {}
    if (type) query.type = type
    if (categoryId) query.categoryId = categoryId
    
    const transactions = await Transaction.find(query)
      .populate('categoryId', 'name color icon')
      .sort({ date: -1 })
      .limit(limit)
      .skip(offset)
      .lean()
    
    const total = await Transaction.countDocuments(query)
    
    return NextResponse.json({
      data: transactions,
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { description, amount, type, categoryId, date, notes } = body
    
    // Validate required fields
    if (!description || !amount || !type || !categoryId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      )
    }
    
    const transaction = new Transaction({
      description,
      amount,
      type,
      categoryId,
      date: new Date(date),
      notes
    })
    
    await transaction.save()
    
    // Populate category details
    await transaction.populate('categoryId', 'name color icon')
    
    return NextResponse.json(
      { data: transaction, message: 'Transaction created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
} 