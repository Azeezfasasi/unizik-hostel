"use client"
import React, { useState, useEffect } from "react"
import DashboardHeader from "@/components/dashboard-component/DashboardHeader";
import DashboardMenu from "@/components/dashboard-component/DashboardMenu";
import { ProtectedRoute } from "../../components/ProtectedRoute"
import DashboardBottomNav from '@/components/dashboard-component/DasboardBottomNav'
import { CampusProvider } from "@/context/CampusContext"

// This is a client layout so we can manage sidebar collapse state.
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleSidebar() {
    setCollapsed(c => !c)
  }

  function toggleMobileMenu() {
    setMobileOpen(v => !v)
  }
  // Add a body-level class while the dashboard is mounted so we can hide
  // the site header that is rendered by the root layout.
  useEffect(() => {
    document.body.classList.add("hide-site-header")
    return () => document.body.classList.remove("hide-site-header")
  }, [])

  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin', 'student', 'staff']}>
      <CampusProvider>
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
          <DashboardHeader onToggleSidebar={toggleSidebar} onToggleMobileMenu={toggleMobileMenu} />

          <div className="flex pt-16">
            <DashboardMenu collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <main className="flex-1 p-6 pt-4">{children}</main>
          </div>
          {/* <div className="mt-[100px]">
            <DashboardBottomNav />
          </div> */}
        </div>
      </CampusProvider>
    </ProtectedRoute>
  )
}
