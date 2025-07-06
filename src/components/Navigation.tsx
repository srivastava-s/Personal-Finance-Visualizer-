"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, CreditCard, BarChart3, Settings, Tag, Target, TrendingUp } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
} 