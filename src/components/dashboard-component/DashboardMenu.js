"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, NotepadText, Contact, TableProperties, Users, Mails, Images, UserPen, House, SearchSlash, Target, UsersRound, FilePlusCorner, HandHeart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'

function Icon({ name }) {
  switch (name) {
    case 'dashboard':
      return (
        <LayoutDashboard className="w-5 h-5" />
      )
    case 'Home':
      return (
        <House className="w-5 h-5" />
      )
    case 'projects':
      return (
        <Briefcase className="w-5 h-5" />
      )
    case 'blog':
      return (
        <NotepadText className="w-5 h-5" />
      )
    case 'Contact':
      return (
        <Contact  className="w-5 h-5" />
      )
    case 'Quote Requests':
    return (
      <TableProperties className="w-5 h-5" />
    )
    case 'Users':
    return (
      <Users className="w-5 h-5" />
    )
    case 'Newsletter':
    return (
      <Mails className="w-5 h-5" />
    )
    case 'Profile':
    return (
      <UserPen className="w-5 h-5" />
    )
    case 'About':
    return (
      <SearchSlash className="w-5 h-5" />
    )
    case 'Gallery':
    return (
      <Images className="w-5 h-5" />
    )
    case 'Website Logo':
    return (
      <Target className="w-5 h-5" />
    )
    case 'Manage Leadership':
    return (
      <UsersRound className="w-5 h-5" />
    )
    case 'Contact Page':
    return (
      <Contact className="w-5 h-5" />
    )
    case 'Join Us':
    return (
      <FilePlusCorner className="w-5 h-5" />
      )
    case 'Donate':
    return (
      <HandHeart className="w-5 h-5" />
    )
    default:
      return null
  }
}

export default function DashboardMenu({ collapsed, mobileOpen = false, onClose = () => { } }) {
  const { user } = useAuth()
  const pathname = usePathname() || ''
  const items = [
    // dashboard
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['super admin', 'admin', 'staff', 'student'] },

    // hostel management
    {
      href: '/dashboard/hostel',
      label: 'Hostel',
      icon: 'blog',
      roles: ['super admin', 'admin', 'staff', 'student'],
      children: [
        { href: '/dashboard/my-room-details', label: 'My Room Details', roles: ['student'] },
        { href: '/dashboard/request-a-room', label: 'Request a room', roles: ['student'] },
        { href: '/dashboard/campus-list', label: 'Campus List', roles: ['super admin', 'admin'] },
        { href: '/dashboard/hostel-list', label: 'Hostel List', roles: ['super admin', 'admin'] },
        { href: '/dashboard/manage-rooms', label: 'Manage Rooms', roles: ['super admin', 'admin'] },
        { href: '/dashboard/all-room-requests', label: 'All Room Requests', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/room-allocations', label: 'Room Allocations', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/assign-rooms', label: 'Assign Rooms', roles: ['super admin', 'admin'] },
        { href: '/dashboard/occupancy', label: 'Occupancy', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/students-room-history', label: 'Students Room History', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/room-history', label: 'Room History', roles: ['super admin', 'admin', 'staff'] },
      ]
    },

    // Facility management
    {
      href: '/dashboard/facility',
      label: 'Facilities',
      icon: 'blog',
      roles: ['super admin', 'admin', 'staff', 'student'],
      children: [
        { href: '/dashboard/all-facilities', label: 'All Facilities', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/add-facilities', label: 'Add Facilities', roles: ['super admin', 'admin'] },
        { href: '/dashboard/add-facility-category', label: 'Add Category', roles: ['super admin', 'admin'] },
        { href: '/dashboard/report-damages', label: 'Report Damages', roles: ['super admin', 'admin', 'staff', 'student'] },
        { href: '/dashboard/all-damage-reports', label: 'All Damage Reports', roles: ['super admin', 'admin', 'staff'] },
      ]
    },

    // Student management
    {
      href: '/dashboard/student',
      label: 'Students',
      icon: 'blog',
      roles: ['super admin', 'admin', 'staff',],
      children: [
        { href: '/dashboard/all-students', label: 'All Students', roles: ['super admin', 'admin'] },
        { href: '/dashboard/add-students', label: 'Add Students', roles: ['super admin', 'admin'] }
      ]
    },

    // Contact form responses
    { href: '/dashboard/contact-form-responses', label: 'Contact Form Responses', icon: 'Contact', roles: ['super admin', 'admin'] },

    // Blog management
    {
      href: '/dashboard/blog',
      label: 'Blog',
      icon: 'blog',
      roles: ['super admin', 'admin', 'staff'],
      children: [
        { href: '/dashboard/add-blog', label: 'Add Blog', roles: ['super admin', 'admin'] },
        { href: '/dashboard/manage-blog', label: 'Manage Blogs', roles: ['super admin', 'admin'] },
        { href: '/dashboard/add-blog-category', label: 'Manage Blog Categories', roles: ['super admin', 'admin'] }
      ]
    },

    // User management
    {
      href: '/dashboard/users',
      label: 'Manage Users',
      icon: 'Users',
      roles: ['super admin', 'admin'],
      children: [
        { href: '/dashboard/all-users', label: 'All Users', roles: ['super admin', 'admin'] },
        { href: '/dashboard/add-user', label: 'Add User', roles: ['super admin', 'admin'] },
        { href: '/dashboard/change-user-password', label: 'Change User Password', roles: ['super admin'] },
      ]
    },

    // Newsletter management
    {
      href: '/dashboard/newsletter',
      label: 'Newsletter Management',
      icon: 'Newsletter',
      roles: ['super admin', 'admin', 'staff'],
      children: [
        { href: '/dashboard/send-newsletter', label: 'Send Newsletter', roles: ['super admin', 'admin'] },
        { href: '/dashboard/all-newsletters', label: 'All Newsletters', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/subscribers', label: 'Subscribers', roles: ['super admin', 'admin'] },
      ]
    },

    // Complaints management
    {
      href: '/dashboard/complaints',
      label: 'Complaints',
      icon: 'blog',
      roles: ['super admin', 'admin', 'staff', 'student'],
      children: [
        { href: '/dashboard/manage-complaints', label: 'Manage Complaints', roles: ['super admin', 'admin', 'staff'] },
        { href: '/dashboard/send-complaint', label: 'Send a Complaint', roles: ['super admin', 'admin', 'staff', 'student'] },
      ]
    },

    // NOTE: Transaction Management and Announcements are intentionally hidden —
    // their pages have no backing model/API yet (see implementation plan §1.4).
    // Re-add once the backend exists so the links aren't dead ends.

    { href: '/dashboard/all-notifications', label: 'All Notifications', icon: 'Profile', roles: ['super admin', 'admin', 'staff', 'student'] },

    // Gallery management
    {
      href: '/dashboard/gallery',
      label: 'Gallery Management',
      icon: 'Gallery',
      roles: ['super admin', 'admin', 'staff'],
      children: [
        { href: '/dashboard/add-gallery', label: 'Add Gallery', roles: ['super admin', 'admin'] },
        { href: '/dashboard/all-gallery', label: 'All Gallery', roles: ['super admin', 'admin'] },
      ]
    },

    // Profile management
    { href: '/dashboard/my-profile', label: 'Profile', icon: 'Profile', roles: ['super admin', 'admin', 'staff', 'student'] },

    // Page Content Management
    {
      href: '/dashboard/homepage-contents',
      label: 'HomePage Contents',
      icon: 'Home',
      roles: ['super admin', 'admin'],
      children: [
        { href: '/dashboard/hero-content', label: 'Hero Slider', roles: ['super admin', 'admin'] },
        { href: '/dashboard/welcome-cta-content', label: 'Welcome CTA', roles: ['super admin', 'admin'] },
        { href: '/dashboard/testimonial-content', label: 'Testimonials', roles: ['super admin', 'admin'] },
        { href: '/dashboard/manage-message-slider', label: 'Manage Message Slider', roles: ['super admin', 'admin'] },
      ]
    },
    // {
    //   href: '/dashboard/about-contents',
    //   label: 'About Page Contents',
    //   icon: 'About',
    //   roles: ['super admin'],
    //   children: [
    //     { href: '/dashboard/company-overview-content', label: 'Company Overview', roles: ['super admin'] },
    //     { href: '/dashboard/team-content', label: 'Executive Leaders', roles: ['super admin'] },
    //     { href: '/dashboard/why-choose-us-content', label: 'Why Choose Us', roles: ['super admin'] },
    //   ]
    // },
    {
      href: '/dashboard/logo',
      label: 'Website Logo',
      icon: 'Website Logo',
      roles: ['super admin', 'admin'],
      children: [
        { href: '/dashboard/website-logo', label: 'Website Logo', roles: ['super admin', 'admin'] },
      ]
    },
    {
      href: '/dashboard/contact-contents',
      label: 'Contact Page Contents',
      icon: 'Contact Page',
      roles: ['super admin', 'admin'],
      children: [
        { href: '/dashboard/contact-details-content', label: 'Contact Details', roles: ['super admin', 'admin'] },
      ]
    },
  ]

   // Helper function to check if user has access to item
  const hasAccess = (itemRoles) => {
    if (!itemRoles) return true; // No role restriction
    return itemRoles.includes(user?.role);
  }

  const [openKey, setOpenKey] = useState(null)

  function toggleSub(key) {
    setOpenKey(prev => (prev === key ? null : key))
  }

  // Desktop / large screens: persistent sidebar
  const desktopNav = (
    <nav className={`hidden lg:flex pt-[15px] h-screen overflow-y-auto bg-slate-950 border-r border-gray-100 ${collapsed ? 'w-16' : 'w-75'} transition-width duration-200`} aria-label="Dashboard navigation">
      <div className="h-full overflow-y-auto py-6 px-2">
        <ul className="space-y-1">
          {items.map(i => {
            // Check if user has access to this item
            if (!hasAccess(i.roles)) return null;

            const hasChildren = Array.isArray(i.children) && i.children.length > 0
            const active = hasChildren ? (pathname === i.href || pathname.startsWith(i.href + '/')) : pathname === i.href
            const isOpen = openKey === i.href
            // Filter children based on access
            const visibleChildren = hasChildren ? i.children.filter(c => hasAccess(c.roles)) : [];

            return (
              <li key={i.href}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleSub(i.href)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${active ? 'bg-[#00bba7] text-white shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
                    >
                      <span className="flex justify-start items-center gap-2">
                        <span className="shrink-0"> <Icon name={i.icon} /> </span>
                        {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{i.label}</span>}
                      </span>
                      {!collapsed && (
                        <svg className={`w-4 h-4 transition-transform duration-150 ${active ? 'text-blue-900' : 'text-blue-200'} ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l6 4-6 4V6z" />
                        </svg>
                      )}
                    </button>

                    {/* Submenu (desktop) */}
                    {!collapsed && isOpen && (
                      <ul className="mt-1 space-y-0.5 pl-10 border-l border-white/10 ml-5">
                        {i.children.map(c => (
                          <li key={c.href}>
                            <Link href={c.href} className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${pathname === c.href ? 'bg-teal-500/10 text-teal-300 font-medium shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link href={i.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${active ? 'bg-teal-500/10 text-teal-300 font-medium shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                    <span className="shrink-0"> <Icon name={i.icon} /> </span>
                    {!collapsed && <span className="text-sm font-medium">{i.label}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )

  // Mobile overlay nav: only visible when mobileOpen is true
  const mobileNav = mobileOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <nav className="relative z-50 h-full w-[85%] md:w-[50%] bg-slate-950 border-r border-gray-100">
        <div className="h-full overflow-y-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex flex-col items-center gap-3">
              <Image src="/images/uniziklogo.png" alt="UNIZIK Logo" width={170} height={50} className="w-20 block rounded-md" />
            </Link>
            <button aria-label="Close menu" onClick={onClose} className="p-2 rounded-md text-red-600 hover:bg-gray-100">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ul className="space-y-1">
              {items.map(i => {
                // Check if user has access to this item
                if (!hasAccess(i.roles)) return null;

                const hasChildren = Array.isArray(i.children) && i.children.length > 0
                const active = hasChildren ? (pathname === i.href || pathname.startsWith(i.href + '/')) : pathname === i.href
                const isOpen = openKey === i.href
                // Filter children based on access
                const visibleChildren = hasChildren ? i.children.filter(c => hasAccess(c.roles)) : [];

                return (
                  <li key={i.href}>
                    {hasChildren ? (
                      <div>
                        <button onClick={() => toggleSub(i.href)} className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${active ? 'bg-teal-500/10 text-teal-300 shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                          <span className="flex items-center gap-3">
                            <span className="shrink-0"> <Icon name={i.icon} /> </span>
                            <span className="text-sm font-medium">{i.label}</span>
                          </span>
                          <svg className={`w-4 h-4 transition-transform duration-150 ${active ? 'text-teal-300' : 'text-blue-200'} ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l6 4-6 4V6z" />
                          </svg>
                        </button>

                        {/* Mobile submenu accordion */}
                        {isOpen && (
                          <ul className="mt-1 space-y-0.5 pl-9 border-l border-white/10 ml-5">
                            {i.children.map(c => (
                              <li key={c.href}>
                                <Link href={c.href} onClick={onClose} className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${pathname === c.href ? 'bg-teal-500/10 text-teal-300 font-medium shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link href={i.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${active ? 'bg-teal-500/10 text-teal-300 font-medium shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
                        <span className="shrink-0"> <Icon name={i.icon} /> </span>
                        <span className="text-sm font-medium">{i.label}</span>
                      </Link>
                    )}
                  </li>
                )
              })}
          </ul>
        </div>
      </nav>
    </div>
  ) : null

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  )
}
