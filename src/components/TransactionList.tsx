"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ITransaction } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

interface TransactionListProps {
  transactions: ITransaction[]
  loading: boolean
  onEdit: (transaction: ITransaction) => void
  onDelete: (id: string) => void
}

export default function TransactionList({ 
  transactions, 
  loading, 
  onEdit, 
  onDelete 
}: TransactionListProps) {
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const { toast } = useToast()

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
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
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'amount':
        aValue = a.amount
        bValue = b.amount
        break
      case 'description':
        aValue = a.description.toLowerCase()
        bValue = b.description.toLowerCase()
        break
      default:
        return 0
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId)
  }

  if (loading || categoriesLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <div className="flex space-x-2 ml-auto">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add your first transaction to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
        <div className="col-span-4">
          <button
            onClick={() => handleSort('description')}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <span>Description</span>
            {sortField === 'description' && (
              <span className="text-xs">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-2">
          <button
            onClick={() => handleSort('amount')}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <span>Amount</span>
            {sortField === 'amount' && (
              <span className="text-xs">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">
          <button
            onClick={() => handleSort('date')}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <span>Date</span>
            {sortField === 'date' && (
              <span className="text-xs">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Transaction Items */}
      <div className="space-y-2">
        {sortedTransactions.map((transaction) => {
          const category = getCategoryById(transaction.categoryId)
          
          return (
            <Card key={transaction._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Description */}
                  <div className="col-span-4">
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    {category ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unknown Category</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(transaction._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(
                transactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 