'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, CheckCircle, XCircle, Clock, AlertCircle, Search, User } from 'lucide-react'
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

export default function StudentsRoomHistoryPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDropdown, setShowDropdown] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch students list
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isAuthenticated || !token || (user?.role !== 'admin' && user?.role !== 'super admin')) return

      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Failed to fetch students')

        const data = await res.json()
        const studentsList = (data.data || data.users || []).filter((u) => u.role === 'student')
        setStudents(studentsList)
      } catch (err) {
        console.error('Error fetching students:', err)
      }
    }

    if (isAuthenticated && token && (user?.role === 'admin' || user?.role === 'super admin')) {
      fetchStudents()
    }
  }, [isAuthenticated, token, user?.role])

  // Fetch selected student's room history
  const handleStudentSelect = async (student) => {
    setSelectedStudent(student)
    setShowDropdown(false)
    setSearchQuery('')
    setHistory([])
    setError(null)

    try {
      setLoading(true)

      // Fetch all room requests for the selected student
      const requestsRes = await fetch(`/api/room/student-requests/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      let requests = []

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        requests = requestsData.requests || []
      } else if (requestsRes.status !== 404) {
        throw new Error('Failed to fetch room requests')
      }

      // Fetch hostels for mapping
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

      // Enrich requests with hostel data
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

  // Filter students based on search
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      student.firstName?.toLowerCase().includes(query) ||
      student.lastName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.matricNumber?.toLowerCase().includes(query)
    )
  })

  // Filter history by status
  const filteredHistory = filterStatus === 'all' ? history : history.filter((h) => h.status === filterStatus)

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Search}
        title="Student Room History"
        subtitle="View all past room allocations for students"
      />

      {/* Student Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Student</label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or matric number..."
              value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
                if (selectedStudent) setSelectedStudent(null)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleStudentSelect(student)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.matricNumber || student.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {searchQuery ? 'No students found' : 'Start typing to search'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Student Info */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm opacity-90">
                <div>
                  <p className="opacity-75">Matric Number</p>
                  <p className="font-semibold">{selectedStudent.matricNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="opacity-75">Email</p>
                  <p className="font-semibold">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="opacity-75">Phone</p>
                  <p className="font-semibold">{selectedStudent.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null)
                setHistory([])
                setFilterStatus('all')
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors text-sm shrink-0"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {selectedStudent ? (
        <>
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

          {/* Timeline / Cards */}
          {loading ? (
            <PageSpinner label="Loading room history..." />
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
              message={
                filterStatus !== 'all'
                  ? 'Try changing your filter.'
                  : 'This student has no room requests or allocations.'
              }
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={User}
          title="Select a student to view their room history"
          message="Use the search box above to find a student"
        />
      )}
    </div>
  )
}
