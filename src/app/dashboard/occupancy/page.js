'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, AlertCircle, Eye, BarChart3, Bed, Users, Percent } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import { PageSpinner, TableSkeleton } from '@/components/dashboard-component/ui/Skeleton'

const PAGE_SIZE = 10

export default function OccupancyPage() {
  const { isAuthenticated, loading: authLoading, token, isAdmin, isStaff } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState([])
  const [hostels, setHostels] = useState([])
  const [totalCapacity, setTotalCapacity] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [selectedBlock, setSelectedBlock] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Redirect if not authenticated or not admin/staff
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !(isAdmin || isStaff))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, isAdmin, isStaff, router])

  // Fetch allocations data
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!isAuthenticated || !token || !(isAdmin || isStaff)) return

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
        const { allocations: allocationsData, capacity } = transformAllocations(
          roomsData.data || [],
          hostelsData.data || []
        )
        setAllocations(allocationsData)
        setTotalCapacity(capacity)
        setHostels(hostelsData.data || [])
      } catch (err) {
        console.error('Error fetching allocations:', err)
        setError(err.message || 'Failed to load allocations')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token && (isAdmin || isStaff)) {
      fetchAllocations()
    }
  }, [isAuthenticated, token, isAdmin, isStaff])

  // Transform room data to allocation records, plus total bed capacity
  const transformAllocations = (rooms, hostelsList) => {
    const allocations = []
    const hostelMap = {}
    let capacity = 0

    hostelsList.forEach((h) => {
      hostelMap[h._id] = h
    })

    rooms.forEach((room) => {
      const hostel = hostelMap[room.hostelId?._id || room.hostelId]
      if (!hostel) return

      capacity += room.capacity || 0

      if (!room.assignedStudents?.length) return

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

    return { allocations, capacity }
  }

  // Get unique values for filters
  const hostelNames = useMemo(() => {
    const unique = [...new Set(allocations.map((a) => a.hostel))]
    return unique
  }, [allocations])

  const blocks = useMemo(() => {
    const filtered = selectedHostel === 'all' ? allocations : allocations.filter((a) => a.hostel === selectedHostel)
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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedHostel, selectedBlock])

  const totalPages = Math.max(1, Math.ceil(filteredAllocations.length / PAGE_SIZE))
  const paginatedAllocations = filteredAllocations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Aggregate stats (computed from the data already fetched — occupied beds vs total capacity)
  const occupancyRate = totalCapacity > 0 ? Math.round((allocations.length / totalCapacity) * 100) : 0

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || !(isAdmin || isStaff)) {
    return null
  }

  return (
    <div className="space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={BarChart3}
        title="Current Occupancy"
        subtitle="View all student room allocations and overall occupancy"
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Occupied Beds</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{allocations.length}</p>
            </div>
            <div className="bg-blue-900/5 p-3 rounded-lg">
              <Users className="text-blue-900" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Capacity</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalCapacity}</p>
            </div>
            <div className="bg-blue-900/5 p-3 rounded-lg">
              <Bed className="text-blue-900" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{occupancyRate}%</p>
            </div>
            <div className="bg-blue-900/5 p-3 rounded-lg">
              <Percent className="text-blue-900" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or matric no."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          {/* Hostel Filter */}
          <select
            value={selectedHostel}
            onChange={(e) => {
              setSelectedHostel(e.target.value)
              setSelectedBlock('all')
            }}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
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
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white disabled:opacity-50"
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
        <TableSkeleton rows={6} cols={8} />
      ) : filteredAllocations.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3.5 text-left">Student</th>
                    <th className="px-6 py-3.5 text-left">Matric No.</th>
                    <th className="px-6 py-3.5 text-left">Campus</th>
                    <th className="px-6 py-3.5 text-left">Hostel</th>
                    <th className="px-6 py-3.5 text-left">Block</th>
                    <th className="px-6 py-3.5 text-left">Floor</th>
                    <th className="px-6 py-3.5 text-left">Room</th>
                    <th className="px-6 py-3.5 text-left">Bed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAllocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{alloc.studentName}</td>
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedAllocations.map((alloc) => (
              <div key={alloc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="space-y-3">
                  {/* Student Name and Matric */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{alloc.studentName}</p>
                    <span className="text-xs bg-blue-50 text-blue-900 px-2 py-1 rounded-full">{alloc.matricNo}</span>
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
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-medium">Block</p>
                      <p className="text-sm font-bold text-gray-900">{alloc.block}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-medium">Floor</p>
                      <p className="text-sm font-bold text-gray-900">{alloc.floor}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-medium">Room</p>
                      <p className="text-sm font-bold text-gray-900">{alloc.room}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAllocations.length}
            pageSize={PAGE_SIZE}
          />
        </>
      ) : (
        <EmptyState
          icon={Eye}
          title="No allocations found"
          message={
            searchTerm || selectedHostel !== 'all' || selectedBlock !== 'all'
              ? 'Try adjusting your filters or search term.'
              : 'No students have been assigned to rooms yet.'
          }
        />
      )}
    </div>
  )
}
