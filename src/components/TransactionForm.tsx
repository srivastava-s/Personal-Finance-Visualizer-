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
import { useToast } from '@/hooks/use-toast'

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

interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

interface TransactionFormProps {
  transaction?: ITransaction | null
  onSubmit: (data: Omit<TransactionFormData, 'amount'> & { amount: number }) => void
  onCancel: () => void
}

export default function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const result = await response.json()
        
        if (result.success) {
          setCategories(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to fetch categories",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Filter categories based on selected type
  useEffect(() => {
    const type = watch('type')
    const filtered = categories.filter(cat => cat.type === type)
    setFilteredCategories(filtered)
    
    // Set default category when type changes
    if (filtered.length > 0 && !watch('categoryId')) {
      setValue('categoryId', filtered[0]._id)
    }
  }, [watch('type'), categories, setValue, watch('categoryId')])

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
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
                <div className="flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-red-600">{errors.categoryId.message}</p>
        )}
        {filteredCategories.length === 0 && (
          <p className="text-sm text-amber-600">
            No categories available for {watch('type')} type. Please create some categories first.
          </p>
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
        <Button type="submit" disabled={isSubmitting || filteredCategories.length === 0}>
          {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  )
} 