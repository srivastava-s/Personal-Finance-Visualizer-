"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, DollarSign, Calendar, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import MonthlyExpensesChart from '@/components/charts/MonthlyExpensesChart'
import { ITransaction } from '@/types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Add transaction
  const handleAddTransaction = async (transactionData: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) throw new Error('Failed to add transaction')
      
      await fetchTransactions()
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    }
  }

  // Update transaction
  const handleUpdateTransaction = async (id: string, transactionData: any) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) throw new Error('Failed to update transaction')
      
      await fetchTransactions()
      setEditingTransaction(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
    }
  }

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete transaction')
      
      await fetchTransactions()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }

  // Edit transaction
  const handleEditTransaction = (transaction: ITransaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Your spending trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpensesChart transactions={transactions} />
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                onCancel={handleCloseForm}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Your complete transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            loading={loading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  )
} 