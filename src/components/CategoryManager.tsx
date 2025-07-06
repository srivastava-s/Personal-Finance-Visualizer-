"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  transactionCount?: number
}

interface CategoryFormData {
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

const defaultFormData: CategoryFormData = {
  name: '',
  type: 'expense',
  color: '#3B82F6',
  icon: '💰'
}

const iconOptions = [
  '💰', '💼', '📈', '🏢', '🎁', '🍽️', '🚗', '🛍️', '🎬', '⚡',
  '🏥', '📚', '🏠', '🛡️', '📝', '🎯', '💡', '🌟', '🎉', '💎'
]

const colorOptions = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  '#F43F5E', '#A855F7', '#06B6D4', '#059669', '#DC2626'
]

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const seedCategories = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Categories seeded successfully"
        })
        fetchCategories()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to seed categories",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed categories",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: editingCategory 
            ? "Category updated successfully" 
            : "Category created successfully"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save category",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        })
        fetchCategories()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading categories...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <div className="flex space-x-2">
          {categories.length === 0 && (
            <Button 
              onClick={seedCategories} 
              disabled={isSubmitting}
              variant="outline"
            >
              {isSubmitting ? "Seeding..." : "Seed Default Categories"}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Update the category details below.' 
                    : 'Create a new category for your transactions.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'income' | 'expense') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-10 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-2 rounded border text-lg ${
                          formData.icon === icon 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color 
                            ? 'border-gray-800' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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
                      ? (editingCategory ? "Updating..." : "Creating...") 
                      : (editingCategory ? "Update" : "Create")
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No categories found</p>
              <p className="text-sm text-muted-foreground">
                Seed default categories or create your own to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category)}
                      disabled={category.transactionCount && category.transactionCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {category.transactionCount || 0} transactions
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 