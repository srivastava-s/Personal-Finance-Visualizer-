import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Finance Visualizer',
  description: 'A modern web application for tracking and visualizing personal finances',
  keywords: ['finance', 'budget', 'tracking', 'visualization', 'money'],
  authors: [{ name: 'Personal Finance Visualizer' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold">💰 Finance Tracker</h1>
                  <Navigation />
                </div>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
} 