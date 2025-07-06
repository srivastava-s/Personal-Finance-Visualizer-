import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/models/Category'
import Transaction from '@/models/Transaction'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const category = await Category.findById(params.id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
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
    const { name, type, color, icon } = body
    
    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      )
    }
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either income or expense' },
        { status: 400 }
      )
    }
    
    const category = await Category.findByIdAndUpdate(
      params.id,
      { name, type, color, icon },
      { new: true, runValidators: true }
    )
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category' },
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
    
    // Check if category exists
    const category = await Category.findById(params.id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Check if category is being used by any transactions
    const transactionCount = await Transaction.countDocuments({ categoryId: params.id })
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. It is being used by ${transactionCount} transaction(s).` 
        },
        { status: 400 }
      )
    }
    
    await Category.findByIdAndDelete(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 