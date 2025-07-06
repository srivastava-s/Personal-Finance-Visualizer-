import mongoose, { Schema, Document } from 'mongoose'

export interface IBudgetDocument extends Document {
  categoryId: mongoose.Types.ObjectId
  amount: number
  period: 'monthly' | 'yearly'
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      validate: {
        validator: function(v: number) {
          return v > 0
        },
        message: 'Amount must be a positive number'
      }
    },
    period: {
      type: String,
      required: [true, 'Budget period is required'],
      enum: {
        values: ['monthly', 'yearly'],
        message: 'Period must be either monthly or yearly'
      },
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IBudgetDocument, v: Date) {
          return !v || v > this.startDate
        },
        message: 'End date must be after start date'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual for category details
BudgetSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
})

// Virtual for actual spending
BudgetSchema.virtual('actualSpending', {
  ref: 'Transaction',
  localField: 'categoryId',
  foreignField: 'categoryId',
  pipeline: [
    {
      $match: {
        type: 'expense',
        date: {
          $gte: function() {
            const start = new Date(this.startDate)
            return new Date(start.getFullYear(), start.getMonth(), 1)
          },
          $lt: function() {
            const start = new Date(this.startDate)
            return new Date(start.getFullYear(), start.getMonth() + 1, 1)
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ],
  justOne: true
})

// Indexes for better query performance
BudgetSchema.index({ categoryId: 1, startDate: -1 })
BudgetSchema.index({ isActive: 1, startDate: -1 })
BudgetSchema.index({ period: 1, startDate: -1 })

// Pre-save middleware to validate category exists and is expense type
BudgetSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    const Category = mongoose.model('Category')
    const category = await Category.findById(this.categoryId)
    
    if (!category) {
      throw new Error('Category not found')
    }
    
    // Budgets should only be set for expense categories
    if (category.type !== 'expense') {
      throw new Error('Budgets can only be set for expense categories')
    }
  }
  next()
})

// Static method to get current month's budget for a category
BudgetSchema.statics.getCurrentBudget = async function(categoryId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  return this.findOne({
    categoryId,
    startDate: { $lte: endOfMonth },
    $or: [
      { endDate: { $gte: startOfMonth } },
      { endDate: { $exists: false } }
    ],
    isActive: true
  }).populate('category')
}

// Static method to get all current budgets
BudgetSchema.statics.getCurrentBudgets = async function() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  return this.find({
    startDate: { $lte: endOfMonth },
    $or: [
      { endDate: { $gte: startOfMonth } },
      { endDate: { $exists: false } }
    ],
    isActive: true
  }).populate('category')
}

export default mongoose.models.Budget || mongoose.model<IBudgetDocument>('Budget', BudgetSchema) 