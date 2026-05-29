'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Truck, Wrench, Fuel, FlaskConical,
  Building2, Users, BarChart3, ScrollText, LogOut, ChevronRight, X,
} from 'lucide-react'

const nav = [
  { href: '/',                label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/vehicles',        label: 'Vehicles',         icon: Truck },
  { href: '/servicing',       label: 'Servicing',        icon: Wrench },
  { href: '/fuel-tanks',      label: 'Fuel Tanks',       icon: FlaskConical },
  { href: '/fuel-receipts',   label: 'Fuel Receipts',    icon: Fuel },
  { href: '/fuel-dispensings',label: 'Dispensings',      icon: Fuel },
  { href: '/branches',        label: 'Branches',         icon: Building2 },
  { href: '/staff',           label: 'Staff',            icon: Users },
  { href: '/reports',         label: 'Reports',          icon: BarChart3 },
  { href: '/activity-log',    label: 'Activity Log',     icon: ScrollText },
]

interface SidebarProps {
  userName: string
  userRole: string
  role: string
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ userName, userRole, role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const visibleNav = nav.filter((item) => {
    if (item.href === '/activity-log') return role === 'admin'
    if (item.href === '/branches') return ['admin', 'branch_manager'].includes(role)
    if (item.href === '/staff') return ['admin', 'branch_manager'].includes(role)
    return true
  })

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full',
      'transition-transform duration-200 ease-in-out',
      'lg:relative lg:translate-x-0 lg:z-auto',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="Pumeco" className="w-9 h-9 shrink-0 object-contain" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight">Pumeco Fleet</p>
          <p className="text-gray-500 text-xs">Management System</p>
        </div>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition group',
                active
                  ? 'bg-orange-500/15 text-orange-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-orange-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <span className="text-orange-400 text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-gray-500 text-xs">{userRole}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
