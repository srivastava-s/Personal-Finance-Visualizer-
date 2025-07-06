import mongoose, { Schema, Document } from 'mongoose'

export interface ICategoryDocument extends Document {
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Category type must be either income or expense'
      }
    },
    color: {
      type: String,
      default: '#3B82F6',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v)
        },
        message: 'Color must be a valid hex color code'
      }
    },
    icon: {
      type: String,
      default: '💰',
      maxlength: [10, 'Icon cannot exceed 10 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual for transaction count
CategorySchema.virtual('transactionCount', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
})

// Index for better query performance
CategorySchema.index({ type: 1, name: 1 })

// Pre-save middleware to ensure unique names per type
CategorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isModified('type')) {
    const existingCategory = await mongoose.model('Category').findOne({
      name: this.name,
      type: this.type,
      _id: { $ne: this._id }
    })
    
    if (existingCategory) {
      throw new Error(`Category "${this.name}" already exists for ${this.type} type`)
    }
  }
  next()
})

export default mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema) 