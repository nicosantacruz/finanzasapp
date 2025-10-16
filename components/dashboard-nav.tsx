'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Receipt,
  CreditCard,
  FileText,
  Users,
  Wallet,
  Settings,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompanySelector } from '@/components/company-selector'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transacciones', href: '/transactions', icon: Receipt },
  { name: 'Cheques', href: '/checks', icon: CreditCard },
  { name: 'Créditos', href: '/credits', icon: FileText },
  { name: 'Proveedores', href: '/suppliers', icon: Users },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Empresas', href: '/companies', icon: Building2 },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r border-border/50 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background md:flex md:w-72 md:flex-col shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo and Title */}
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
              <span className="text-2xl font-bold text-white">DF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight">
                Dashboard
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Financiero
              </span>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <div className="border-b border-border/50 p-5">
          <CompanySelector />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-5">
          {navigation.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-luxury',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
