import { Suspense } from 'react'
import Link from 'next/link'
import BudgetManager from '@/components/BudgetManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BudgetsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set and manage your monthly category budgets
          </p>
        </div>
      </div>
      
      <Suspense fallback={<BudgetManagerSkeleton />}>
        <BudgetManager />
      </Suspense>
    </div>
  )
}

function BudgetManagerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-1">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 