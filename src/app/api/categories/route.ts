import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/models/Category'

// Predefined categories for seeding
const predefinedCategories = [
  // Income categories
  { name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
  { name: 'Freelance', type: 'income', color: '#3B82F6', icon: '💼' },
  { name: 'Investment', type: 'income', color: '#8B5CF6', icon: '📈' },
  { name: 'Business', type: 'income', color: '#F59E0B', icon: '🏢' },
  { name: 'Other Income', type: 'income', color: '#6B7280', icon: '🎁' },
  
  // Expense categories
  { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍽️' },
  { name: 'Transportation', type: 'expense', color: '#06B6D4', icon: '🚗' },
  { name: 'Shopping', type: 'expense', color: '#EC4899', icon: '🛍️' },
  { name: 'Entertainment', type: 'expense', color: '#F97316', icon: '🎬' },
  { name: 'Utilities', type: 'expense', color: '#6366F1', icon: '⚡' },
  { name: 'Healthcare', type: 'expense', color: '#84CC16', icon: '🏥' },
  { name: 'Education', type: 'expense', color: '#8B5CF6', icon: '📚' },
  { name: 'Housing', type: 'expense', color: '#F59E0B', icon: '🏠' },
  { name: 'Insurance', type: 'expense', color: '#10B981', icon: '🛡️' },
  { name: 'Other Expenses', type: 'expense', color: '#6B7280', icon: '📝' }
]

export async function GET() {
  try {
    await dbConnect()
    
    const categories = await Category.find({}).sort({ type: 1, name: 1 })
    
    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    
    const category = new Category({
      name,
      type,
      color: color || '#3B82F6',
      icon: icon || '💰'
    })
    
    await category.save()
    
    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    )
  }
}

// Seed predefined categories
export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'seed') {
      // Check if categories already exist
      const existingCount = await Category.countDocuments()
      
      if (existingCount > 0) {
        return NextResponse.json({
          success: false,
          error: 'Categories already exist. Cannot seed again.'
        }, { status: 400 })
      }
      
      // Insert predefined categories
      const categories = await Category.insertMany(predefinedCategories)
      
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${categories.length} categories`,
        data: categories
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    )
  }
} 