'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Users, Building2, AlertCircle, Loader, X, Plus, Trash2, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AssignRoomsPage() {
  const { isAuthenticated, loading: authLoading, token } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState('all')
  
  // Modal states
  const [assignModal, setAssignModal] = useState({ isOpen: false, room: null, selectedStudents: [] })
  const [isAssigning, setIsAssigning] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) return

      try {
        setLoading(true)
        setError(null)

        // Fetch students, rooms, and hostels
        const [studentsRes, roomsRes, hostelsRes] = await Promise.all([
          fetch('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/room', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/hostel', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!studentsRes.ok || !roomsRes.ok || !hostelsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const studentsData = await studentsRes.json()
        const roomsData = await roomsRes.json()
        const hostelsData = await hostelsRes.json()

        // Filter students (only those without room assignments or students)
        const unassignedStudents = studentsData.data?.filter(
          (student) => student.role === 'student'
        ) || []

        setStudents(unassignedStudents)
        setRooms(roomsData.data || [])
        setHostels(hostelsData.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchData()
    }
  }, [isAuthenticated, token])

  // Get hostel name from ID
  const getHostelName = (hostelId) => {
    const hostel = hostels.find((h) => h._id === hostelId)
    return hostel?.name || 'Unknown Hostel'
  }

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const hostelIdStr = room.hostelId?._id || room.hostelId
      const hostelName = getHostelName(hostelIdStr)
      
      const matchesHostel = selectedHostel === 'all' || hostelName === selectedHostel
      const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesHostel && matchesSearch
    })
  }, [rooms, selectedHostel, searchTerm, hostels])

  // Available students (not in selected room)
  const availableStudents = useMemo(() => {
    if (!assignModal.room) return students
    
    const roomAssignedIds = new Set(
      assignModal.room.assignedStudents?.map((s) => s._id) || []
    )

    return students.filter((s) => !roomAssignedIds.has(s._id))
  }, [students, assignModal.room])

  // Handle assign room
  const handleAssignRoom = (room) => {
    setAssignModal({
      isOpen: true,
      room,
      selectedStudents: [],
    })
  }

  // Handle save assignment
  const handleSaveAssignment = async () => {
    if (assignModal.selectedStudents.length === 0) {
      alert('Please select at least one student')
      return
    }

    try {
      setIsAssigning(true)

      // Add students to room
      for (const studentId of assignModal.selectedStudents) {
        const response = await fetch('/api/room/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: assignModal.room._id,
            studentId: studentId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to assign student to room')
        }
      }

      // Refresh rooms data
      const roomsRes = await fetch('/api/room', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const roomsData = await roomsRes.json()
      setRooms(roomsData.data || [])

      setAssignModal({ isOpen: false, room: null, selectedStudents: [] })
      alert('Students assigned successfully!')
    } catch (err) {
      console.error('Error assigning students:', err)
      alert('Failed to assign students: ' + err.message)
    } finally {
      setIsAssigning(false)
    }
  }

  // Handle unassign student
  const handleUnassignStudent = async (roomId, studentId) => {
    if (!confirm('Are you sure you want to unassign this student?')) return

    try {
      const response = await fetch('/api/room/unassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: roomId,
          studentId: studentId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to unassign student')
      }

      // Refresh rooms data
      const roomsRes = await fetch('/api/room', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const roomsData = await roomsRes.json()
      setRooms(roomsData.data || [])

      alert('Student unassigned successfully!')
    } catch (err) {
      console.error('Error unassigning student:', err)
      alert('Failed to unassign student: ' + err.message)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Rooms to Students</h1>
          <p className="text-gray-600">Manage room assignments for students</p>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Hostel Filter */}
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Hostels</option>
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel.name}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const occupancy = room.assignedStudents?.length || 0
              const capacity = room.capacity || 4
              const available = capacity - occupancy
              const hostelIdStr = room.hostelId?._id || room.hostelId
              const hostelName = getHostelName(hostelIdStr)

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                    <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                    <p className="text-blue-100 text-sm">{hostelName}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-4">
                    {/* Capacity */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Capacity</span>
                        <span className="font-semibold">
                          {occupancy}/{capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            occupancy === capacity
                              ? 'bg-red-500'
                              : occupancy > 0
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(occupancy / capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Available */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-xs text-gray-600">Available</p>
                        <p className="text-lg font-bold text-green-600">{available}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-200">
                        <p className="text-xs text-gray-600">Occupied</p>
                        <p className="text-lg font-bold text-red-600">{occupancy}</p>
                      </div>
                    </div>

                    {/* Assigned Students */}
                    {occupancy > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Assigned Students ({occupancy}):
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {room.assignedStudents?.map((student) => (
                            <div
                              key={student._id}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                            >
                              <span className="text-gray-700">
                                {student.firstName} {student.lastName}
                              </span>
                              <button
                                onClick={() => handleUnassignStudent(room._id, student._id)}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Unassign student"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3">
                    <button
                      onClick={() => handleAssignRoom(room)}
                      disabled={available === 0}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                        available === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Plus size={16} />
                      Assign Student{available > 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No rooms found.</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || selectedHostel !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create some rooms first.'}
            </p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={assignModal.isOpen}
        room={assignModal.room}
        availableStudents={availableStudents}
        selectedStudents={assignModal.selectedStudents}
        onSelectionChange={(ids) =>
          setAssignModal((prev) => ({ ...prev, selectedStudents: ids }))
        }
        onSave={handleSaveAssignment}
        onClose={() => setAssignModal({ isOpen: false, room: null, selectedStudents: [] })}
        isAssigning={isAssigning}
      />
    </div>
  )
}

// Assign Modal Component
function AssignModal({
  isOpen,
  room,
  availableStudents,
  selectedStudents,
  onSelectionChange,
  onSave,
  onClose,
  isAssigning,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen || !room) return null

  const filteredStudents = availableStudents.filter((student) =>
    `${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      onSelectionChange(selectedStudents.filter((id) => id !== studentId))
    } else {
      onSelectionChange([...selectedStudents, studentId])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-xl font-bold">Assign Students</h2>
            <p className="text-green-100 text-sm mt-1">Room {room.roomNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="text-white hover:bg-green-700 p-2 rounded-full transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="p-4">
          {filteredStudents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <label
                  key={student._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 text-sm">
                {availableStudents.length === 0
                  ? 'No unassigned students available'
                  : 'No students match your search'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 sticky bottom-0 space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{selectedStudents.length}</span> student
            {selectedStudents.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isAssigning}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isAssigning || selectedStudents.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:bg-gray-400 font-medium"
            >
              {isAssigning && <Loader size={16} className="animate-spin" />}
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
