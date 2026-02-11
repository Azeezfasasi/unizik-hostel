'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Building2, Users, Bed, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCampus } from '@/context/CampusContext'
import { useRouter } from 'next/navigation'

// Bed Component
const BedIcon = ({ occupied }) => (
  <div
    className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm cursor-pointer transition-transform hover:scale-110 ${
      occupied
        ? 'bg-red-500 text-white'
        : 'bg-green-500 text-white'
    }`}
  >
    <Bed size={20} />
  </div>
)

// Room Card Component
const RoomCard = ({ room, hostelCode, block }) => {
  const occupancyPercentage = Math.round((room.occupancy / room.capacity) * 100)
  const vacantBeds = room.capacity - room.occupancy

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="mb-2 sm:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</span>
            {block && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Block {block}</span>}
          </div>
          <p className="text-xs text-gray-500">ID: {hostelCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              room.status === 'occupied'
                ? 'bg-red-100 text-red-700'
                : room.status === 'partly-occupied'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {room.status === 'occupied'
              ? 'Occupied'
              : room.status === 'partly-occupied'
              ? 'Partly Occupied'
              : 'Vacant'}
          </span>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">
            {room.occupancy} / {room.capacity} Beds Occupied
          </span>
          <span className="text-xs font-semibold text-gray-700">{occupancyPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              room.status === 'occupied'
                ? 'bg-red-500'
                : room.status === 'partly-occupied'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      {/* Beds Grid */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">
          Available: <span className="text-green-600 font-semibold">{vacantBeds}</span> | 
          Occupied: <span className="text-red-600 font-semibold">{room.occupancy}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: room.capacity }).map((_, index) => (
            <BedIcon key={index} occupied={index < room.occupancy} />
          ))}
        </div>
      </div>

      {/* Assigned Students */}
      {room.assignedStudents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Assigned Students:</p>
          <div className="flex flex-wrap gap-2">
            {room.assignedStudents.map((student, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {student}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Floor Section Component
const FloorSection = ({ hostel, rooms }) => {
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalOccupancy = rooms.reduce((sum, room) => sum + room.occupancy, 0)
  const availableBeds = totalCapacity - totalOccupancy

  return (
    <div className="mb-8 last:mb-0">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <Building2 size={20} />
              {hostel.hostelName}
            </h3>
            <div className="flex items-center gap-4 ml-7 text-sm text-gray-600 flex-wrap">
              <p><span className="font-semibold">Block:</span> {hostel.block}</p>
              <p><span className="font-semibold">Floor:</span> {hostel.floor}</p>
              <p><span className="font-semibold">Rooms:</span> {rooms.length}</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600">Available</p>
              <p className="text-lg font-bold text-green-600">{availableBeds}</p>
            </div>
            <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600">Occupied</p>
              <p className="text-lg font-bold text-red-600">{totalOccupancy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} hostelCode={hostel.hostelCode} block={hostel.block} />
        ))}
      </div>
    </div>
  )
}

// Main Component
export default function RoomAllocationsPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth()
  const { hostels } = useCampus()
  const router = useRouter()
  const [roomData, setRoomData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [selectedBlock, setSelectedBlock] = useState('all')
  const [selectedFloor, setSelectedFloor] = useState('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch rooms data only
  useEffect(() => {
    const fetchRooms = async () => {
      if (!isAuthenticated || !token) return

      try {
        setLoading(true)
        setError(null)

        // Fetch rooms from backend
        const roomsRes = await fetch('/api/room', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!roomsRes.ok) {
          throw new Error('Failed to fetch data from server')
        }

        const roomsData = await roomsRes.json()

        if (!roomsData.success) {
          throw new Error('Server returned an error')
        }

        // Transform the backend data to match our component structure
        const transformedData = transformRoomData(roomsData.data, hostels)
        setRoomData(transformedData)
      } catch (err) {
        console.error('Error fetching room data:', err)
        setError(err.message || 'Failed to load room allocations')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token && hostels.length > 0) {
      fetchRooms()
    }
  }, [isAuthenticated, token, hostels])

  // Transform backend data to our format
  const transformRoomData = (rooms, hostelsList) => {
    if (!Array.isArray(rooms) || !Array.isArray(hostelsList)) {
      return []
    }

    // Create a map of hostels for quick lookup
    const hostelMap = {}
    hostelsList.forEach((hostel) => {
      hostelMap[hostel._id] = hostel
    })

    // Group rooms by hostel and floor
    const grouped = {}

    rooms.forEach((room) => {
      const hostel = hostelMap[room.hostelId?._id || room.hostelId]
      if (!hostel) return

      const key = `${room.hostelId?._id || room.hostelId}-${room.roomFloor || 'Unknown'}`

      if (!grouped[key]) {
        grouped[key] = {
          id: room.hostelId?._id || room.hostelId,
          hostelName: hostel.name || 'Unknown Hostel',
          hostelCode: hostel.block || '',
          block: hostel.block || 'N/A',
          floor: room.roomFloor || 'N/A',
          rooms: [],
        }
      }

      const occupancy = room.currentOccupancy || 0
      let status = 'vacant'
      if (occupancy === room.capacity) {
        status = 'occupied'
      } else if (occupancy > 0) {
        status = 'partly-occupied'
      }

      // Extract student names from assigned students
      const studentNames = (room.assignedStudents || []).map(
        (student) => `${student.firstName || ''} ${student.lastName || ''}`.trim()
      )

      grouped[key].rooms.push({
        id: room._id,
        roomNumber: room.roomNumber || `Room ${room._id}`,
        capacity: room.capacity || 4,
        occupancy: occupancy,
        assignedStudents: studentNames,
        status: status,
      })
    })

    return Object.values(grouped)
  }

  // Extract unique values for filters
  const hostelsList = useMemo(() => {
    const unique = [...new Set(roomData.map((item) => item.hostelName))]
    return unique
  }, [roomData])

  const blocks = useMemo(() => {
    const filtered = roomData.filter(
      (item) => selectedHostel === 'all' || item.hostelName === selectedHostel
    )
    const unique = [...new Set(filtered.map((item) => item.block))]
    return unique
  }, [selectedHostel, roomData])

  const floors = useMemo(() => {
    const filtered = roomData.filter(
      (item) =>
        (selectedHostel === 'all' || item.hostelName === selectedHostel) &&
        (selectedBlock === 'all' || item.block === selectedBlock)
    )
    const unique = [...new Set(filtered.map((item) => item.floor))]
    return unique
  }, [selectedHostel, selectedBlock, roomData])

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return roomData.filter(
      (item) =>
        (selectedHostel === 'all' || item.hostelName === selectedHostel) &&
        (selectedBlock === 'all' || item.block === selectedBlock) &&
        (selectedFloor === 'all' || item.floor === selectedFloor)
    )
  }, [selectedHostel, selectedBlock, selectedFloor, roomData])

  // Calculate statistics
  const stats = useMemo(() => {
    const filtered = filteredData.flatMap((hostel) => hostel.rooms)
    const totalCapacity = filtered.reduce((sum, room) => sum + room.capacity, 0)
    const totalOccupancy = filtered.reduce((sum, room) => sum + room.occupancy, 0)
    const vacant = totalCapacity - totalOccupancy

    return { totalCapacity, totalOccupancy, vacant }
  }, [filteredData])

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Allocation Overview</h1>
          <p className="text-gray-600">Manage and monitor room occupancy across all hostels</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-32"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronDown size={20} />
                Filters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Hostel Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hostel</label>
                  <select
                    value={selectedHostel}
                    onChange={(e) => {
                      setSelectedHostel(e.target.value)
                      setSelectedBlock('all')
                      setSelectedFloor('all')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Hostels</option>
                    {hostelsList.map((hostel) => (
                      <option key={hostel} value={hostel}>
                        {hostel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Block Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value)
                      setSelectedFloor('all')
                    }}
                    disabled={blocks.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
                  >
                    <option value="all">All Blocks</option>
                    {blocks.map((block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    disabled={floors.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50"
                  >
                    <option value="all">All Floors</option>
                    {floors.map((floor) => (
                      <option key={floor} value={floor}>
                        {floor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Available Beds</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.vacant}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Bed className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Occupied Beds</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.totalOccupancy}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Users className="text-red-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Capacity</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalCapacity}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms Display */}
            {filteredData.length > 0 ? (
              <div className="space-y-8">
                {filteredData.map((hostel) => (
                  <FloorSection
                    key={`${hostel.id}-${hostel.floor}`}
                    hostel={hostel}
                    rooms={hostel.rooms}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No rooms found with the selected filters.</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filter selections.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
