'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Users, Building2, AlertCircle, Loader, X, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { notify } from '@/components/dashboard-component/ui/toast'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'

export default function AssignRoomsPage() {
  const { isAuthenticated, loading: authLoading, token, isAdmin } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')

  // Modal states
  const [assignModal, setAssignModal] = useState({ isOpen: false, room: null, selectedStudents: [] })
  const [isAssigning, setIsAssigning] = useState(false)
  const [unassignTarget, setUnassignTarget] = useState(null) // { roomId, studentId, studentName }
  const [isUnassigning, setIsUnassigning] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, isAdmin, router])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token || !isAdmin) return

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
        const unassignedStudents = studentsData.data?.filter((student) => student.role === 'student') || []

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

    if (isAuthenticated && token && isAdmin) {
      fetchData()
    }
  }, [isAuthenticated, token, isAdmin])

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

    const roomAssignedIds = new Set(assignModal.room.assignedStudents?.map((s) => s._id) || [])

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
      notify.error('Please select at least one student')
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
      notify.success('Students assigned successfully!')
    } catch (err) {
      console.error('Error assigning students:', err)
      notify.error('Failed to assign students: ' + err.message)
    } finally {
      setIsAssigning(false)
    }
  }

  // Handle unassign student — open confirmation
  const requestUnassignStudent = (roomId, student) => {
    setUnassignTarget({
      roomId,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
    })
  }

  const confirmUnassignStudent = async () => {
    if (!unassignTarget) return

    try {
      setIsUnassigning(true)
      const response = await fetch('/api/room/unassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: unassignTarget.roomId,
          studentId: unassignTarget.studentId,
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

      notify.success('Student unassigned successfully!')
      setUnassignTarget(null)
    } catch (err) {
      console.error('Error unassigning student:', err)
      notify.error('Failed to unassign student: ' + err.message)
    } finally {
      setIsUnassigning(false)
    }
  }

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Users}
        title="Assign Rooms to Students"
        subtitle="Manage room assignments for students"
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          {/* Hostel Filter */}
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
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
        <PageSpinner label="Loading rooms..." />
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
              >
                {/* Header */}
                <div className="bg-blue-900 p-4 text-white">
                  <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                  <p className="text-blue-100 text-sm">{hostelName}</p>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 space-y-4">
                  {/* Capacity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-semibold text-gray-900">
                        {occupancy}/{capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          occupancy === capacity ? 'bg-red-500' : occupancy > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(occupancy / capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Available */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <p className="text-xs text-gray-600">Available</p>
                      <p className="text-lg font-bold text-emerald-600">{available}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border border-red-200">
                      <p className="text-xs text-gray-600">Occupied</p>
                      <p className="text-lg font-bold text-red-600">{occupancy}</p>
                    </div>
                  </div>

                  {/* Assigned Students */}
                  {occupancy > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Assigned Students ({occupancy}):</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {room.assignedStudents?.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm"
                          >
                            <span className="text-gray-700">
                              {student.firstName} {student.lastName}
                            </span>
                            <button
                              onClick={() => requestUnassignStudent(room._id, student)}
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
                <div className="border-t border-gray-100 p-3">
                  <button
                    onClick={() => handleAssignRoom(room)}
                    disabled={available === 0}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                      available === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
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
        <EmptyState
          icon={Building2}
          title="No rooms found"
          message={
            searchTerm || selectedHostel !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create some rooms first.'
          }
        />
      )}

      {/* Assign Modal */}
      <AssignModal
        isOpen={assignModal.isOpen}
        room={assignModal.room}
        availableStudents={availableStudents}
        selectedStudents={assignModal.selectedStudents}
        onSelectionChange={(ids) => setAssignModal((prev) => ({ ...prev, selectedStudents: ids }))}
        onSave={handleSaveAssignment}
        onClose={() => setAssignModal({ isOpen: false, room: null, selectedStudents: [] })}
        isAssigning={isAssigning}
      />

      {/* Unassign Confirmation */}
      <ConfirmModal
        isOpen={!!unassignTarget}
        title="Unassign student?"
        message={
          unassignTarget
            ? `Remove ${unassignTarget.studentName} from this room? Their bed will become available for other students.`
            : ''
        }
        confirmLabel="Unassign"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={isUnassigning}
        onConfirm={confirmUnassignStudent}
        onClose={() => !isUnassigning && setUnassignTarget(null)}
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
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      onSelectionChange(selectedStudents.filter((id) => id !== studentId))
    } else {
      onSelectionChange([...selectedStudents, studentId])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="text-xl font-bold">Assign Students</h2>
            <p className="text-blue-100 text-sm mt-1">Room {room.roomNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="text-white hover:bg-blue-800 p-2 rounded-full transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
                    className="w-4 h-4 text-blue-900 rounded focus:ring-2 focus:ring-blue-900/30"
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
                {availableStudents.length === 0 ? 'No unassigned students available' : 'No students match your search'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 sticky bottom-0 space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{selectedStudents.length}</span> student
            {selectedStudents.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isAssigning}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isAssigning || selectedStudents.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
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
