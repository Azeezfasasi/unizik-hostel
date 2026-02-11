import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../context/AuthContext';

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

  // Fetch notifications when component mounts and refresh periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const [registrationRes, welcomeRes, donationsRes] = await Promise.all([
          fetch('/api/joinus?status=pending&limit=5'),
          fetch('/api/welcome?limit=5'),
          fetch('/api/donations?status=pending&limit=5')
        ]);

        const registrationData = registrationRes.ok ? await registrationRes.json() : { data: [] };
        const welcomeData = welcomeRes.ok ? await welcomeRes.json() : { data: [] };
        const donationsData = donationsRes.ok ? await donationsRes.json() : { donations: [] };

        const combinedNotifications = [
          ...(registrationData.data || []).map(item => ({
            id: item._id,
            type: 'registration',
            title: `Registration Request: ${item.firstName} ${item.lastName}`,
            message: item.email,
            timestamp: item.createdAt,
            data: item
          })),
          ...(welcomeData.data || []).map(item => ({
            id: item._id,
            type: 'welcome',
            title: `Welcome Form: ${item.title}`,
            message: item.description1 || 'New submission',
            timestamp: item.createdAt,
            data: item
          })),
          ...(donationsData.donations || []).map(item => ({
            id: item._id,
            type: 'donation',
            title: `New Donation: ${item.donationType || 'Donation'}`,
            message: `${item.currency} ${item.amount}`,
            timestamp: item.createdAt,
            data: item
          }))
        ];

        // Sort by timestamp, newest first
        combinedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(combinedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    // Fetch on mount
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (!notificationDropdownOpen) return;

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const [registrationRes, contactRes, donationsRes] = await Promise.all([
          fetch('/api/joinus?status=pending&limit=5'),
          fetch('/api/contact?status=pending&limit=5'),
          fetch('/api/donations?status=pending&limit=5')
        ]);

        const registrationData = registrationRes.ok ? await registrationRes.json() : { data: [] };
        const contactData = contactRes.ok ? await contactRes.json() : { data: [] };
        const donationsData = donationsRes.ok ? await donationsRes.json() : { donations: [] };

        const combinedNotifications = [
          ...(registrationData.data || []).map(item => ({
            id: item._id,
            type: 'registration',
            title: `Registration Request: ${item.firstName} ${item.lastName}`,
            message: item.email,
            timestamp: item.createdAt,
            data: item
          })),
          ...(contactData.data || []).map(item => ({
            id: item._id,
            type: 'contact',
            title: `Contact Form: ${item.subject}`,
            message: item.email,
            timestamp: item.createdAt,
            data: item
          })),
          ...(donationsData.donations || []).map(item => ({
            id: item._id,
            type: 'donation',
            title: `New Donation: ${item.donationType || 'Donation'}`,
            message: `${item.currency} ${item.amount}`,
            timestamp: item.createdAt,
            data: item
          }))
        ];

        // Sort by timestamp, newest first
        combinedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(combinedNotifications);
        console.log('Notifications loaded:', combinedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <button
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
              className="hidden lg:inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
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
          <div className="flex items-center gap-8">
            <div className="relative" ref={notificationRef}>
              <button 
                aria-label="Notifications" 
                onClick={() => setNotificationDropdownOpen((open) => !open)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationDropdownOpen && (
                <div className="fixed md:absolute md:right-0 left-0 right-0 md:left-auto dtop-auto md:top-full md:mt-2 top-[80px] md:bottom-auto w-full md:w-80 bg-white border border-gray-200 rounded-t-md md:rounded-md shadow-lg z-50 animate-fade-in max-h-96 overflow-y-auto md:max-h-96 mx-0 md:mx-0">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No new notifications</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <li key={notification.id} className="hover:bg-gray-50 transition">
                          <Link 
                            href={notification.type === 'registration' 
                              ? '/dashboard/member-registration-request' 
                              : notification.type === 'donation'
                              ? '/dashboard/all-donations'
                              : '/dashboard/contact-form-responses'}
                            className="block px-4 py-3"
                            onClick={() => setNotificationDropdownOpen(false)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'registration' ? 'bg-blue-500' : notification.type === 'donation' ? 'bg-purple-500' : 'bg-green-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                                notification.type === 'registration' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : notification.type === 'donation'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {notification.type === 'registration' ? 'Registration' : notification.type === 'donation' ? 'Donation' : 'Contact'}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <Link 
                      href="/dashboard/all-notifications" 
                      className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2"
                      onClick={() => setNotificationDropdownOpen(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-900"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="rounded-[50%] overflow-hidden">
                  <Image src={avatar} alt="User avatar" width={32} height={32} className="object-cover h-10 w-10" />
                </div>
                <div className='flex flex-col items-start'>
                  <span className="hidden sm:block text-sm text-gray-700">{fullName || 'User'}</span>
                  <span className="hidden sm:block text-sm text-gray-700">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fade-in">
                  <ul className="py-1">
                    <li>
                      <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition w-full text-left">Back to Home</Link>
                    </li>
                    {user?.role === 'admin' || user?.role === 'committee' || user?.role === 'it-support' ? (
                    <li>
                      <Link href="https://mail.zoho.com/" target='_blank' className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition w-full text-left">Access Zoho Email</Link>
                    </li>
                    ) : null}
                    {user?.role === 'admin' || user?.role === 'committee' || user?.role === 'it-support' ? (
                    <li>
                      <Link href="/dashboard/member-registration-request" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition w-full text-left">Registration Requests</Link>
                    </li>
                    ) : null}
                    {user?.role === 'admin' || user?.role === 'committee' || user?.role === 'it-support' ? (
                    <li>
                      <Link href="/dashboard/my-profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition w-full text-left">Profile</Link>
                    </li>
                    ) : null}
                    <li>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition">Logout</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
