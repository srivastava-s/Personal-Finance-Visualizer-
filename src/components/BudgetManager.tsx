"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Edit, Trash2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

interface Budget {
  _id: string
  categoryId: string
  category: Category
  amount: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  isActive: boolean
  actualSpending?: number
  remaining?: number
  percentage?: number
  status?: 'good' | 'warning' | 'over'
}

interface BudgetFormData {
  categoryId: string
  amount: string
  period: 'monthly' | 'yearly'
  startDate: string
  endDate?: string
}

const defaultFormData: BudgetFormData = {
  categoryId: '',
  amount: '',
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0]
}

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState<BudgetFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories and budgets in parallel
      const [categoriesResponse, budgetsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/budgets?includeSpending=true')
      ])
      
      const categoriesResult = await categoriesResponse.json()
      const budgetsResult = await budgetsResponse.json()
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data.filter((cat: Category) => cat.type === 'expense'))
      }
      
      if (budgetsResult.success) {
        setBudgets(budgetsResult.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoryId || !formData.amount) {
      toast({
        title: "Error",
        description: "Category and amount are required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      const url = editingBudget 
        ? `/api/budgets/${editingBudget._id}`
        : '/api/budgets'
      
      const method = editingBudget ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: editingBudget 
            ? "Budget updated successfully" 
            : "Budget created successfully"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save budget",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Are you sure you want to delete the budget for "${budget.category.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${budget._id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Budget deleted successfully"
        })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete budget",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : undefined
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditingBudget(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'over':
        return <Badge variant="destructive">Over Budget</Badge>
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>
      default:
        return <Badge variant="default">On Track</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <TrendingDown className="h-4 w-4 text-green-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading budgets...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budgets</h2>
          <p className="text-muted-foreground">
            Set and manage your monthly category budgets
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget 
                  ? 'Update the budget details below.' 
                  : 'Set a budget for an expense category.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  disabled={!!editingBudget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value: 'monthly' | 'yearly') => 
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (editingBudget ? "Updating..." : "Creating...") 
                    : (editingBudget ? "Update" : "Create")
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No budgets found</p>
              <p className="text-sm text-muted-foreground">
                Create budgets for your expense categories to track spending
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <Card key={budget._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{budget.category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(budget)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                  </div>
                  
                  {budget.actualSpending !== undefined && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Spent</span>
                        <span className="font-semibold">{formatCurrency(budget.actualSpending)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Remaining</span>
                        <span className={`font-semibold ${budget.remaining && budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(budget.remaining || 0)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{budget.percentage}%</span>
                        </div>
                        <Progress value={Math.min(budget.percentage || 0, 100)} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(budget.status || 'good')}
                          {getStatusBadge(budget.status || 'good')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 