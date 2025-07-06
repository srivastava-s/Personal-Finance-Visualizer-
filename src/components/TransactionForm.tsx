"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ITransaction } from '@/types'

// Form validation schema
const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional()
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: ITransaction | null
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
}

// Mock categories for now - in a real app, these would come from the database
const mockCategories = [
  { _id: '1', name: 'Salary', type: 'income', color: '#10b981' },
  { _id: '2', name: 'Freelance', type: 'income', color: '#3b82f6' },
  { _id: '3', name: 'Food & Dining', type: 'expense', color: '#ef4444' },
  { _id: '4', name: 'Transportation', type: 'expense', color: '#06b6d4' },
  { _id: '5', name: 'Shopping', type: 'expense', color: '#ec4899' },
  { _id: '6', name: 'Entertainment', type: 'expense', color: '#f97316' },
  { _id: '7', name: 'Utilities', type: 'expense', color: '#6366f1' },
  { _id: '8', name: 'Healthcare', type: 'expense', color: '#8b5cf6' }
]

export default function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense')
  const [filteredCategories, setFilteredCategories] = useState(mockCategories)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount?.toString() || '',
      type: transaction?.type || 'expense',
      categoryId: transaction?.categoryId || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: transaction?.notes || ''
    }
  })

  // Filter categories based on selected type
  useEffect(() => {
    const type = watch('type')
    setSelectedType(type)
    setFilteredCategories(mockCategories.filter(cat => cat.type === type))
  }, [watch('type')])

  // Set default category when type changes
  useEffect(() => {
    const type = watch('type')
    const availableCategories = mockCategories.filter(cat => cat.type === type)
    if (availableCategories.length > 0 && !watch('categoryId')) {
      setValue('categoryId', availableCategories[0]._id)
    }
  }, [watch('type'), setValue, watch('categoryId')])

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount)
    })
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Enter transaction description"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register('amount')}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={watch('type')}
          onValueChange={(value: 'income' | 'expense') => setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={watch('categoryId')}
          onValueChange={(value) => setValue('categoryId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
        />
        {errors.date && (
          <p className="text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any additional notes..."
          rows={3}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  )
} 