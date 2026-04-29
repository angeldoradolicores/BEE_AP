'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Home, Flower2, CalendarDays, MapPin, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/floracion', icon: Flower2, label: 'Floración' },
  { href: '/dashboard/calendario', icon: CalendarDays, label: 'Calendario' },
  { href: '/dashboard/mapa', icon: MapPin, label: 'Mapa' },
  { href: '/dashboard/mas', icon: MoreHorizontal, label: 'Más' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive 
                    ? 'text-secondary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
