import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Menu, ChevronDown, DoorOpen, MessageSquareWarning, Wrench, LogOut, User as UserIcon, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext';

const NOTIFICATION_META = {
  'room-request': { icon: DoorOpen, dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800', label: 'Room Request' },
  complaint: { icon: MessageSquareWarning, dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800', label: 'Complaint' },
  damage: { icon: Wrench, dot: 'bg-red-500', badge: 'bg-red-100 text-red-800', label: 'Damage Report' },
};

export default function DashboardHeader({ onToggleSidebar, onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const avatar = user && user.avatar ? user.avatar : '/images/profile1.jpg';
  const role = user?.role ? user.role.replace('-', ' ') : 'User';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const notificationRef = useRef(null);
  const [logo, setLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    }
    if (dropdownOpen || notificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, notificationDropdownOpen]);

  // Fetch logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/logo');
        if (response.ok) {
          const data = await response.json();
          if (data.logo) {
            setLogo(data.logo);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };
    
    fetchLogo();
  }, []);

  // Hostel-operations notifications: pending room requests, open complaints,
  // and unresolved damage reports — the actual admin action items for this
  // system, in place of the leftover association-site (joinus/donations) feed.
  const isStaffRole = user && ['super admin', 'admin', 'staff'].includes(user.role);

  const loadNotifications = async () => {
    if (!isStaffRole) return;
    setNotificationsLoading(true);
    try {
      const [requestsRes, complaintsRes, damageRes] = await Promise.all([
        fetch('/api/room/requests'),
        fetch('/api/complaints?status=Open'),
        fetch('/api/facility/damage-reports'),
      ]);

      const requestsData = requestsRes.ok ? await requestsRes.json() : { data: [] };
      const complaintsData = complaintsRes.ok ? await complaintsRes.json() : { data: [] };
      const damageData = damageRes.ok ? await damageRes.json() : { data: [] };

      const pendingRequests = (requestsData.data || []).filter((r) => r.status === 'pending');
      const openComplaints = complaintsData.data || [];
      const pendingDamage = (damageData.data || []).filter(
        (d) => (d.repairStatus || '').toLowerCase() === 'pending'
      );

      const combined = [
        ...pendingRequests.map((item) => ({
          id: item._id,
          type: 'room-request',
          title: `Room Request: ${item.student?.firstName || ''} ${item.student?.lastName || ''}`.trim(),
          message: item.room?.roomNumber ? `Room ${item.room.roomNumber}` : 'Awaiting review',
          timestamp: item.createdAt,
          href: '/dashboard/all-room-requests',
        })),
        ...openComplaints.map((item) => ({
          id: item._id,
          type: 'complaint',
          title: `Complaint: ${item.category || 'General'}`,
          message: item.description?.slice(0, 60) || 'New complaint submitted',
          timestamp: item.createdAt,
          href: '/dashboard/manage-complaints',
        })),
        ...pendingDamage.map((item) => ({
          id: item._id,
          type: 'damage',
          title: `Damage Report: ${item.facilityName}`,
          message: item.description?.slice(0, 60) || 'Awaiting repair',
          timestamp: item.reportedAt,
          href: '/dashboard/all-damage-reports',
        })),
      ];

      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(combined);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch on mount and refresh periodically
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (notificationDropdownOpen) loadNotifications();
  }, [notificationDropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-18 md:h-18">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger: visible on small screens */}
            <button
              aria-label="Open menu"
              onClick={onToggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
              className="hidden lg:inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic logo */}
            <Link href="/" className="flex items-center gap-3">
              {!logoLoading && logo ? (
                <div style={{ width: '80px', height: '80px', position: 'relative', maxWidth: '150px' }}>
                  <Image 
                    src={logo.url} 
                    alt={logo.alt} 
                    fill
                    sizes="(max-width: 768px) 80px, 100px"
                    className="w-[70px] md:w-[100px] object-contain rounded-md p-1" 
                    priority
                  />
                </div>
              ) : (
                <Image 
                  src="/images/uniziklogo.png" 
                  alt="UNIZIK Logo" 
                  width={80} 
                  height={40} 
                  className="w-[70px] md:w-[100px] block rounded-md p-1" 
                  priority
                />
              )}
            </Link>
          </div>

          {/* Notifications section */}
          <div className="flex items-center gap-3 sm:gap-6">
            {isStaffRole && (
            <div className="relative" ref={notificationRef}>
              <button
                aria-label="Notifications"
                onClick={() => setNotificationDropdownOpen((open) => !open)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full ring-2 ring-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationDropdownOpen && (
                <div className="fixed md:absolute md:right-0 left-0 right-0 md:left-auto md:top-full md:mt-2 top-[72px] md:bottom-auto w-full md:w-96 bg-white border border-gray-100 rounded-t-2xl md:rounded-2xl shadow-xl z-50 animate-fade-in max-h-[26rem] overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="text-xs font-medium text-gray-400">{notifications.length} pending</span>
                    )}
                  </div>

                  {notificationsLoading ? (
                    <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-400">You&apos;re all caught up 🎉</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {notifications.slice(0, 8).map((notification) => {
                        const meta = NOTIFICATION_META[notification.type] || NOTIFICATION_META['room-request'];
                        const Icon = meta.icon;
                        return (
                          <li key={`${notification.type}-${notification.id}`} className="hover:bg-gray-50 transition-colors">
                            <Link
                              href={notification.href}
                              className="block px-4 py-3"
                              onClick={() => setNotificationDropdownOpen(false)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${meta.dot}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                  <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {notification.timestamp ? new Date(notification.timestamp).toLocaleDateString() : ''}
                                  </p>
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${meta.badge}`}>
                                  {meta.label}
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="p-3 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
                    <Link
                      href="/dashboard/all-notifications"
                      className="block text-center text-sm font-medium text-blue-900 hover:text-blue-700 py-1.5"
                      onClick={() => setNotificationDropdownOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="rounded-full overflow-hidden ring-2 ring-gray-100">
                  <Image src={avatar} alt="User avatar" width={36} height={36} className="object-cover h-9 w-9" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-800 leading-tight">{fullName || 'User'}</span>
                  <span className="text-xs text-gray-400 leading-tight">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900 truncate">{fullName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <ul className="py-1.5">
                    <li>
                      <Link href="/dashboard/my-profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition w-full text-left" onClick={() => setDropdownOpen(false)}>
                        <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition w-full text-left" onClick={() => setDropdownOpen(false)}>
                        <Home className="w-4 h-4 text-gray-400" /> Back to Website
                      </Link>
                    </li>
                  </ul>
                  <div className="border-t border-gray-50 py-1.5">
                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
