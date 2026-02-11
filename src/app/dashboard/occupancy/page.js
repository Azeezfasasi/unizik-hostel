'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, AlertCircle, Loader, X, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function OccupancyPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [selectedBlock, setSelectedBlock] = useState('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch allocations data
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!isAuthenticated || !token) return

      try {
        setLoading(true)
        setError(null)

        // Fetch rooms and hostels
        const [roomsRes, hostelsRes] = await Promise.all([
          fetch('/api/room', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/hostel', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!roomsRes.ok || !hostelsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const roomsData = await roomsRes.json()
        const hostelsData = await hostelsRes.json()

        // Transform room data to allocations
        const allocationsData = transformAllocations(roomsData.data || [], hostelsData.data || [])
        setAllocations(allocationsData)
        setHostels(hostelsData.data || [])
      } catch (err) {
        console.error('Error fetching allocations:', err)
        setError(err.message || 'Failed to load allocations')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchAllocations()
    }
  }, [isAuthenticated, token])

  // Transform room data to allocation records
  const transformAllocations = (rooms, hostelsList) => {
    const allocations = []
    const hostelMap = {}

    hostelsList.forEach((h) => {
      hostelMap[h._id] = h
    })

    rooms.forEach((room) => {
      const hostel = hostelMap[room.hostelId?._id || room.hostelId]
      if (!hostel || !room.assignedStudents?.length) return

      room.assignedStudents.forEach((student) => {
        allocations.push({
          id: `${room._id}-${student._id}`,
          studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          matricNo: student.matricNumber || 'N/A',
          campus: hostel.hostelCampus || 'Unknown',
          hostel: hostel.name || 'Unknown',
          block: hostel.block || 'N/A',
          floor: room.roomFloor || 'N/A',
          room: room.roomNumber || 'N/A',
          bed: '1', // If you have bed numbers, update this
          studentId: student._id,
          roomId: room._id,
        })
      })
    })

    return allocations
  }

  // Get unique values for filters
  const hostelNames = useMemo(() => {
    const unique = [...new Set(allocations.map((a) => a.hostel))]
    return unique
  }, [allocations])

  const blocks = useMemo(() => {
    const filtered =
      selectedHostel === 'all'
        ? allocations
        : allocations.filter((a) => a.hostel === selectedHostel)
    const unique = [...new Set(filtered.map((a) => a.block))]
    return unique
  }, [allocations, selectedHostel])

  // Filter allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((alloc) => {
      const matchesSearch =
        alloc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alloc.matricNo.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesHostel = selectedHostel === 'all' || alloc.hostel === selectedHostel
      const matchesBlock = selectedBlock === 'all' || alloc.block === selectedBlock

      return matchesSearch && matchesHostel && matchesBlock
    })
  }, [allocations, searchTerm, selectedHostel, selectedBlock])

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Allocations</h1>
          <p className="text-gray-600">View all student room allocations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-blue-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or matric no."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Hostel Filter */}
            <select
              value={selectedHostel}
              onChange={(e) => {
                setSelectedHostel(e.target.value)
                setSelectedBlock('all')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Hostels</option>
              {hostelNames.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>

            {/* Block Filter */}
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={blocks.length === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
            >
              <option value="all">All Blocks</option>
              {blocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading allocations...</p>
          </div>
        ) : filteredAllocations.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Matric NO.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Campus
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Hostel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Block
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Floor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">
                      Bed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAllocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {alloc.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.matricNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.campus}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.hostel}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.block}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.floor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.room}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.bed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredAllocations.map((alloc) => (
                <div key={alloc.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="space-y-3">
                    {/* Student Name and Matric */}
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">{alloc.studentName}</p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {alloc.matricNo}
                        </span>
                      </div>
                    </div>

                    {/* Campus and Hostel */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Campus</p>
                        <p className="text-sm font-medium text-gray-900">{alloc.campus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Hostel</p>
                        <p className="text-sm font-medium text-gray-900">{alloc.hostel}</p>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500 uppercase font-medium">Block</p>
                        <p className="text-sm font-bold text-gray-900">{alloc.block}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500 uppercase font-medium">Floor</p>
                        <p className="text-sm font-bold text-gray-900">{alloc.floor}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500 uppercase font-medium">Room</p>
                        <p className="text-sm font-bold text-gray-900">{alloc.room}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredAllocations.length}</span> of{' '}
                <span className="font-semibold">{allocations.length}</span> allocations
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Eye className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No allocations found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || selectedHostel !== 'all' || selectedBlock !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'No students have been assigned to rooms yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
