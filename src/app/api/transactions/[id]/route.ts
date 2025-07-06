import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Transaction from '@/models/Transaction'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      {
        description,
        amount,
        type,
        categoryId,
        date: new Date(date),
        notes
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color icon')
    
    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const deletedTransaction = await Transaction.findByIdAndDelete(params.id)
    
    if (!deletedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
} 