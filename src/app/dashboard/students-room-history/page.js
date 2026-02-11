'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Building2, MapPin, CheckCircle, XCircle, Clock, Loader, AlertCircle, Search, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Room History</h1>
          <p className="text-gray-600 mt-1">View all past room allocations for students</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Student</label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => handleStudentSelect(student)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
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
                  <div className="px-4 py-6 text-center text-gray-500">
                    {searchQuery ? 'No students found' : 'Start typing to search'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Student Info */}
        {selectedStudent && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
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
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
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
              <div className="flex gap-2 mb-8 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  onClick={() => setFilterStatus('approved')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterStatus === 'approved'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle size={16} />
                  Approved ({history.filter((h) => h.status === 'approved').length})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Clock size={16} />
                  Pending ({history.filter((h) => h.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('declined')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterStatus === 'declined'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <XCircle size={16} />
                  Declined ({history.filter((h) => h.status === 'declined').length})
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-4">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading History</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Timeline / Cards */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
                <p className="text-gray-600">Loading room history...</p>
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Desktop Timeline */}
                <div className="hidden sm:block">
                  {filteredHistory.map((item, idx) => (
                    <div key={item._id} className="flex gap-4">
                      {/* Timeline Connector */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                            item.status === 'approved'
                              ? 'bg-green-500'
                              : item.status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < filteredHistory.length - 1 && <div className="w-1 h-12 bg-gray-300 my-2" />}
                      </div>

                      {/* Card */}
                      <div className="flex-1 pb-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Room {item.room?.roomNumber}
                              </h3>
                              <p className="text-gray-600">{item.hostel.name}</p>
                            </div>
                            <div
                              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${
                                item.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : item.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.status === 'approved' && <CheckCircle size={16} />}
                              {item.status === 'pending' && <Clock size={16} />}
                              {item.status === 'declined' && <XCircle size={16} />}
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </div>
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
                              <MapPin size={16} className="text-blue-600" />
                              {item.hostel.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                  {filteredHistory.map((item, idx) => (
                    <div
                      key={item._id}
                      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                        item.status === 'approved'
                          ? 'border-green-500'
                          : item.status === 'pending'
                          ? 'border-yellow-500'
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Room {item.room?.roomNumber}</h3>
                          <p className="text-sm text-gray-600">{item.hostel.name}</p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                            item.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status === 'approved' && <CheckCircle size={14} />}
                          {item.status === 'pending' && <Clock size={14} />}
                          {item.status === 'declined' && <XCircle size={14} />}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
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
                            <MapPin size={16} className="text-blue-600" />
                            {item.hostel.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No room allocations found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {filterStatus !== 'all'
                    ? 'Try changing your filter.'
                    : 'This student has no room requests or allocations.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Select a student to view their room history</p>
            <p className="text-gray-500 text-sm mt-2">Use the search box above to find a student</p>
          </div>
        )}
      </div>
    </div>
  )
}