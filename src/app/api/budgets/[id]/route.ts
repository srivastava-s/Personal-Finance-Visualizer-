import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Budget from '@/models/Budget'
import Category from '@/models/Category'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const budget = await Budget.findById(params.id).populate('category')
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: budget
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { amount, period, startDate, endDate, isActive } = body
    
    // Validate required fields
    if (!amount || !period) {
      return NextResponse.json(
        { success: false, error: 'Amount and period are required' },
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
    
    const budget = await Budget.findByIdAndUpdate(
      params.id,
      {
        amount,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    ).populate('category')
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: budget
    })
  } catch (error: any) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update budget' },
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
    
    // Check if budget exists
    const budget = await Budget.findById(params.id)
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      )
    }
    
    // Soft delete by setting isActive to false
    await Budget.findByIdAndUpdate(params.id, { isActive: false })
    
    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
} 