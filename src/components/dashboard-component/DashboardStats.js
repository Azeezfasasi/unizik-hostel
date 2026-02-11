"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Client-only last updated time to prevent hydration mismatch
function LastUpdated({ timestamp }) {
  const [now, setNow] = useState('');
  
  useEffect(() => {
    // Update time on client side only
    const updateTime = () => setNow(new Date().toLocaleString());
    updateTime();
    
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return now ? <p className="text-sm text-gray-500 font-semibold">Last updated: <span className='font-normal'><time>{now}</time></span></p> : null;
}

function Icon({ name }) {
  switch (name) {
    case 'campus':
      return (
        <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      )
    case 'hostel':
      return (
        <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 21H21M9 8h6M9 12h6M9 16h6M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M3 21h18" />
        </svg>
      )
    case 'beds':
      return (
        <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'occupied':
      return (
        <svg className="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'students':
      return (
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l9 5 9-5M3 7l9 5 9-5" />
        </svg>
      )
    case 'male':
      return (
        <svg className="w-6 h-6 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="8" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4m0 0v8m0 0l-3-3m3 3l3-3" />
        </svg>
      )
    case 'female':
      return (
        <svg className="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="8" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 12v8m0 0l-3-3m3 3l3-3m-3-8a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      )
    case 'staff':
      return (
        <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9c1.657 0 3 1.343 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.657 1.343-3 3-3zm0 0v6m0-6c-3.314 0-6 2.686-6 6v2a2 2 0 002 2h8a2 2 0 002-2v-2c0-3.314-2.686-6-6-6z" />
        </svg>
      )
    case 'admin':
      return (
        <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'superadmin':
      return (
        <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m0 0l-4-4m4 4l4-4M3 12l9 9 9-9" />
        </svg>
      )
    default:
      return null
  }
}

function Count({ value = 0, duration = 800 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame
    const start = performance.now()
    const from = display
    const to = Number(value) || 0

    function step(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad-like
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)
      if (t < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line
  }, [value])

  return <span className="text-2xl md:text-3xl font-bold text-gray-900">{display.toLocaleString()}</span>
}

export default function DashboardStats({ data = {} }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  // Fetch stats from backend (admin only)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only attempt to fetch if user is admin
        if (user?.role === 'admin' || user?.role === 'super admin') {
          const response = await axios.get('/api/dashboard/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success && response.data.stats) {
            setStats(response.data.stats);
            setLastUpdated(response.data.timestamp || new Date().toISOString());
            return;
          }
        }

        // Fallback to provided data or defaults
        const defaults = {
          campus: 0,
          hostel: 0,
          availableBeds: 0,
          occupiedBeds: 0,
          totalStudents: 0,
          maleStudents: 0,
          femaleStudents: 0,
          totalStaff: 0,
          totalAdmin: 0,
          totalSuperAdmin: 0,
        };
        setStats({ ...defaults, ...data });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load statistics');

        // Fallback to provided data or defaults
        const defaults = {
          campus: 0,
          hostel: 0,
          availableBeds: 0,
          occupiedBeds: 0,
          totalStudents: 0,
          maleStudents: 0,
          femaleStudents: 0,
          totalStaff: 0,
          totalAdmin: 0,
          totalSuperAdmin: 0,
        };
        setStats({ ...defaults, ...data });
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchStats();

      // Refresh stats every 5 minutes
      const interval = setInterval(fetchStats, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [token, user]);

  // Use provided data if no token, otherwise use fetched stats
  const displayStats = stats || data || {
    campus: 0,
    hostel: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    totalStaff: 0,
    totalAdmin: 0,
    totalSuperAdmin: 0,
  };

  const items = [
    { key: 'campus', label: 'Campuses', value: displayStats.campus, icon: 'campus' },
    { key: 'hostel', label: 'Hostels', value: displayStats.hostel, icon: 'hostel' },
    { key: 'availableBeds', label: 'Available Beds', value: displayStats.availableBeds, icon: 'beds' },
    { key: 'occupiedBeds', label: 'Occupied Beds', value: displayStats.occupiedBeds, icon: 'occupied' },
    { key: 'totalStudents', label: 'Total Students', value: displayStats.totalStudents, icon: 'students' },
    { key: 'maleStudents', label: 'Male Students', value: displayStats.maleStudents, icon: 'male' },
    { key: 'femaleStudents', label: 'Female Students', value: displayStats.femaleStudents, icon: 'female' },
    { key: 'totalStaff', label: 'Total Staff', value: displayStats.totalStaff, icon: 'staff' },
    { key: 'totalAdmin', label: 'Total Admin', value: displayStats.totalAdmin, icon: 'admin' },
    { key: 'totalSuperAdmin', label: 'Total Super Admin', value: displayStats.totalSuperAdmin, icon: 'superadmin' },
  ];

  if (error && !stats) {
    return (
      <section aria-labelledby="dashboard-stats" className="mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="text-sm">{error}. Using fallback data.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="dashboard-stats" className="mt-6">
      <div className="flex flex-col md:flex-row items-start md:justify-between mb-4">
        <h2 id="dashboard-stats" className="text-lg font-semibold text-gray-800">
          Overview {loading && <span className="text-xs text-gray-500">(updating...)</span>}
        </h2>
        <LastUpdated timestamp={lastUpdated} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.key}
            className={`bg-white rounded-lg shadow-sm p-3 md:p-4 flex items-start gap-4 ${
              loading ? 'opacity-60' : ''
            }`}
          >
            <div className="shrink-0">
              <Icon name={item.icon} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="lg:truncate">
                  <div className="text-xs font-medium text-gray-500">{item.label}</div>
                  <div className="mt-1">
                    {loading ? (
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                    ) : (
                      <Count value={item.value} />
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">&nbsp;</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
