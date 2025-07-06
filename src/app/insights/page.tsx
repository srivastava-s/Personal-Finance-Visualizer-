import { Suspense } from 'react'
import Link from 'next/link'
import Insights from '@/components/Insights'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function InsightsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Smart analysis of your spending patterns
          </p>
        </div>
      </div>
      
      <Suspense fallback={<InsightsSkeleton />}>
        <Insights />
      </Suspense>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 