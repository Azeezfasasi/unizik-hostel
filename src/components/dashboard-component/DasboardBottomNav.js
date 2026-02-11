'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LayoutDashboard, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function DashboardBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, token } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      size: 16
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      size: 16
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: Users,
      href: '/dashboard/member-registration-request',
      size: 16
    }
  ]

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Call logout API with authorization token
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      // Clear client-side auth state regardless of API response
      logout()
      
      // Redirect to home
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear client-side auth state on error too
      logout()
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white border-t border-gray-200 shadow-2xl">
      {/* Navigation Items */}
      <div className="flex items-center justify-between px-2 py-3">
        {/* Regular Nav Items */}
        <div className="flex items-center justify-between flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`mb-1 transition-all duration-200 ${
                  active
                    ? 'text-blue-600 scale-110'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  <IconComponent size={item.size} strokeWidth={2} />
                </div>
                <span className={`text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
            isLoggingOut
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-red-50 active:bg-red-100'
          }`}
          title="Logout"
        >
          <div className={`mb-1 transition-all duration-200 ${
            isLoggingOut
              ? 'text-gray-400'
              : 'text-gray-600 hover:text-red-600'
          }`}>
            <LogOut size={16} strokeWidth={2} />
          </div>
          <span className={`text-xs font-semibold transition-all duration-200 ${
            isLoggingOut
              ? 'text-gray-400'
              : 'text-gray-600'
          }`}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>

      {/* Divider Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  )
}
