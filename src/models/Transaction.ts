import mongoose, { Schema, Document } from 'mongoose'

export interface ITransactionDocument extends Document {
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: mongoose.Types.ObjectId
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      validate: {
        validator: function(v: number) {
          return v > 0
        },
        message: 'Amount must be a positive number'
      }
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be either income or expense'
      }
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual for category details
TransactionSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
})

// Indexes for better query performance
TransactionSchema.index({ date: -1 })
TransactionSchema.index({ type: 1, date: -1 })
TransactionSchema.index({ categoryId: 1, date: -1 })
TransactionSchema.index({ type: 1, categoryId: 1 })

// Pre-save middleware to validate category exists
TransactionSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    const Category = mongoose.model('Category')
    const category = await Category.findById(this.categoryId)
    
    if (!category) {
      throw new Error('Category not found')
    }
    
    // Ensure category type matches transaction type
    if (category.type !== this.type) {
      throw new Error(`Category type (${category.type}) does not match transaction type (${this.type})`)
    }
  }
  next()
})

export default mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', TransactionSchema) 