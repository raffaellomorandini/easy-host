'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Crown,
  CalendarDays,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react'
import { useState } from 'react'

interface SidebarItem {
  name: string
  href: string
  icon: any
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Leads',
    href: '/dashboard/leads',
    icon: Users,
  },
  {
    name: 'Clienti',
    href: '/dashboard/clienti',
    icon: Crown
  },
  {
    name: 'Appuntamenti',
    href: '/dashboard/appuntamenti',
    icon: Calendar
  },
  {
    name: 'Calendario',
    href: '/dashboard/calendario',
    icon: CalendarDays
  },
  {
    name: 'Task Manager',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  }
]

const quickActions: SidebarItem[] = [
  {
    name: 'Nuova Lead',
    href: '/dashboard/leads/new',
    icon: Plus
  },
  {
    name: 'Nuovo Appuntamento',
    href: '/dashboard/appuntamenti/new',
    icon: Calendar
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    toast.success('Logout effettuato con successo')
    signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EasyHost</h1>
                <p className="text-xs text-gray-500">CRM System</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Utente'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'utente@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-6">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Azioni Rapide
              </p>
              <div className="space-y-1">
                {quickActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/dashboard/settings"
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              <span>Impostazioni</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User menu */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Utente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}