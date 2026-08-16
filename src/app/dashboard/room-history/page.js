'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'

// Decorative tone map for the timeline connector dot / mobile card accent —
// mirrors StatusBadge's color language (emerald/amber/red) but is applied to
// non-text elements that StatusBadge doesn't cover.
const STATUS_TONE = {
  approved: { dot: 'bg-emerald-500', border: 'border-emerald-500' },
  pending: { dot: 'bg-amber-500', border: 'border-amber-500' },
  declined: { dot: 'bg-red-500', border: 'border-red-500' },
}

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: null, activeClass: 'bg-blue-900 text-white' },
  { key: 'approved', label: 'Approved', icon: CheckCircle, activeClass: 'bg-emerald-600 text-white' },
  { key: 'pending', label: 'Pending', icon: Clock, activeClass: 'bg-amber-600 text-white' },
  { key: 'declined', label: 'Declined', icon: XCircle, activeClass: 'bg-red-600 text-white' },
]

export default function RoomHistoryPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch room history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated || !token || !user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch all room requests for the user
        const requestsRes = await fetch('/api/room/my-requests', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!requestsRes.ok) {
          throw new Error('Failed to fetch room history')
        }

        const requestsData = await requestsRes.json()
        const requests = requestsData.requests || []

        // Also fetch hostels for mapping
        const hostelsRes = await fetch('/api/hostel', {
          headers: { Authorization: `Bearer ${token}` },
        })

        let hostelsMap = {}
        if (hostelsRes.ok) {
          const hostelsData = await hostelsRes.json()
          hostelsMap = (hostelsData.data || []).reduce((map, h) => {
            map[h._id] = h
            return map
          }, {})
        }

        // Transform and enrich data
        const enrichedRequests = requests.map((req) => {
          const hostel = hostelsMap[req.room?.hostelId?._id || req.room?.hostelId]
          return {
            ...req,
            hostel: hostel || {},
          }
        })

        // Sort by date (newest first)
        enrichedRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setHistory(enrichedRequests)
      } catch (err) {
        console.error('Error fetching history:', err)
        setError(err.message || 'Failed to load room history')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token && user) {
      fetchHistory()
    }
  }, [isAuthenticated, token, user])

  // Filter history
  const filteredHistory = filterStatus === 'all' ? history : history.filter((h) => h.status === filterStatus)

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Calendar}
        title="Room History"
        subtitle="View all your past room allocations"
        actions={
          <div className="flex items-center gap-2 bg-blue-900/5 px-4 py-2 rounded-lg">
            <Calendar size={18} className="text-blue-900" />
            <span className="text-blue-900 font-medium text-sm">{history.length} Total Allocations</span>
          </div>
        }
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading History</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Status Filter */}
      {!loading && history.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(({ key, label, icon: Icon, activeClass }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === key ? activeClass : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {Icon && <Icon size={16} />}
              {label} ({key === 'all' ? history.length : history.filter((h) => h.status === key).length})
            </button>
          ))}
        </div>
      )}

      {/* Timeline / Cards */}
      {loading ? (
        <PageSpinner label="Loading your room history..." />
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Desktop Timeline */}
          <div className="hidden sm:block">
            {filteredHistory.map((item, idx) => {
              const tone = STATUS_TONE[item.status] || { dot: 'bg-gray-400', border: 'border-gray-300' }
              return (
                <div key={item._id} className="flex gap-4">
                  {/* Timeline Connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${tone.dot}`}
                    >
                      {idx + 1}
                    </div>
                    {idx < filteredHistory.length - 1 && <div className="w-1 h-12 bg-gray-200 my-2" />}
                  </div>

                  {/* Card */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Room {item.room?.roomNumber}
                          </h3>
                          <p className="text-gray-600">{item.hostel.name}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium mb-1">Campus</p>
                          <p className="text-sm font-semibold text-gray-900">{item.hostel.hostelCampus}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium mb-1">Block</p>
                          <p className="text-sm font-semibold text-gray-900">{item.hostel.block || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium mb-1">Bed</p>
                          <p className="text-sm font-semibold text-gray-900">{item.bed || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {item.hostel.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-blue-900" />
                          {item.hostel.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredHistory.map((item) => {
              const tone = STATUS_TONE[item.status] || { dot: 'bg-gray-400', border: 'border-gray-300' }
              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 border-l-4 ${tone.border}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Room {item.room?.roomNumber}</h3>
                      <p className="text-sm text-gray-600">{item.hostel.name}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Campus</p>
                        <p className="text-sm font-semibold text-gray-900">{item.hostel.hostelCampus}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Block</p>
                        <p className="text-sm font-semibold text-gray-900">{item.hostel.block || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Bed</p>
                        <p className="text-sm font-semibold text-gray-900">{item.bed || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {item.hostel.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <MapPin size={16} className="text-blue-900" />
                        {item.hostel.location}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No room allocations found"
          message={filterStatus !== 'all' ? 'Try changing your filter.' : 'You have not made any room requests yet.'}
        />
      )}
    </div>
  )
}
