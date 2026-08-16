'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MapPin, Building2, Search, AlertCircle, Loader, Eye, Edit2, Trash2, X, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { notify } from '@/components/dashboard-component/ui/toast'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'

const CAMPUSES_PER_PAGE = 9

export default function CampusList() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [campusData, setCampusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, campus: null })
  const [editModal, setEditModal] = useState({ isOpen: false, campus: null, editData: null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, campus: null })
  const [addModal, setAddModal] = useState({ isOpen: false, newCampusData: { name: '' } })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch campuses data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) return

      try {
        setLoading(true)
        setError(null)

        // Fetch hostels and rooms data
        const [hostelsRes, roomsRes] = await Promise.all([
          fetch('/api/hostel', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/room', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (!hostelsRes.ok || !roomsRes.ok) {
          throw new Error('Failed to fetch data from server')
        }

        const hostelsData = await hostelsRes.json()
        const roomsData = await roomsRes.json()

        if (!hostelsData.success) {
          throw new Error('Failed to fetch hostels')
        }

        // Transform data to get campuses with their hostels and bed stats
        const campuses = transformCampusData(hostelsData.data, roomsData.data || [])
        
        setCampusData(campuses)
      } catch (err) {
        console.error('Error fetching campus data:', err)
        setError(err.message || 'Failed to load campuses')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchData()
    }
  }, [isAuthenticated, token])

  // Transform backend data to campus format
  const transformCampusData = (hostels, rooms) => {
    if (!Array.isArray(hostels)) {
      return []
    }

    // Group rooms by hostel ID
    const roomsByHostel = {}
    if (Array.isArray(rooms)) {
      rooms.forEach((room) => {
        // Handle both populated object and string ID
        const hostelId = room.hostelId?._id || room.hostelId || room.hostel
        if (hostelId) {
          const hostelIdStr = hostelId.toString()
          if (!roomsByHostel[hostelIdStr]) {
            roomsByHostel[hostelIdStr] = []
          }
          roomsByHostel[hostelIdStr].push(room)
        }
      })
    }

    const campusMap = {}

    hostels.forEach((hostel) => {
      const campusName = hostel.hostelCampus || 'Unknown Campus'

      if (!campusMap[campusName]) {
        campusMap[campusName] = {
          id: campusName,
          name: campusName,
          hostels: [],
          totalRooms: 0,
          totalCapacity: 0,
          totalOccupancy: 0,
          totalStudents: 0,
        }
      }

      // Calculate bed stats for this hostel - use string version of ID
      const hostelIdStr = hostel._id.toString()
      const hostelRooms = roomsByHostel[hostelIdStr] || []

      const availableBeds = hostelRooms.reduce((sum, room) => {
        const occupied = room.assignedStudents ? room.assignedStudents.length : 0
        return sum + (room.capacity - occupied)
      }, 0)
      const occupiedBeds = hostelRooms.reduce((sum, room) => {
        return sum + (room.assignedStudents ? room.assignedStudents.length : 0)
      }, 0)
      const totalCapacity = hostelRooms.reduce((sum, room) => sum + (room.capacity || 0), 0)

      const enrichedHostel = {
        ...hostel,
        availableBeds,
        occupiedBeds,
        totalCapacity,
      }

      campusMap[campusName].hostels.push(enrichedHostel)
      campusMap[campusName].totalRooms += hostelRooms.length
      campusMap[campusName].totalCapacity += totalCapacity
      campusMap[campusName].totalOccupancy += occupiedBeds
    })

    return Object.values(campusMap)
  }

  // Handle view campus
  const handleView = (campus) => {
    setViewModal({ isOpen: true, campus })
  }

  // Handle edit campus
  const handleEdit = (campus) => {
    setEditModal({ isOpen: true, campus, editData: { name: campus.name } })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editModal.editData.name.trim()) {
      notify.error('Campus name is required')
      return
    }

    if (editModal.editData.name === editModal.campus.name) {
      // No changes made
      setEditModal({ isOpen: false, campus: null, editData: null })
      return
    }

    try {
      setIsSaving(true)
      const oldCampusName = editModal.campus.name
      const newCampusName = editModal.editData.name
      
      // Update all hostels in this campus with the new campus name
      const updatePromises = editModal.campus.hostels.map(hostel =>
        fetch(`/api/hostel/${hostel._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...hostel,
            hostelCampus: newCampusName,
          }),
        }).then(res => {
          if (!res.ok) throw new Error('Failed to update hostel')
          return res.json()
        })
      )

      await Promise.all(updatePromises)

      // Update local state with new campus name
      setCampusData(prev => prev.map(c => 
        c.id === oldCampusName 
          ? { ...c, id: newCampusName, name: newCampusName }
          : c
      ))

      setEditModal({ isOpen: false, campus: null, editData: null })
      notify.success('Campus renamed successfully!')
    } catch (err) {
      console.error('Error saving campus:', err)
      notify.error('Failed to save campus: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete campus
  const handleDelete = async () => {
    if (!deleteModal.campus) return

    try {
      setIsDeleting(true)
      
      // Delete all hostels in this campus
      const deletePromises = deleteModal.campus.hostels.map(hostel =>
        fetch(`/api/hostel/${hostel._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).then(res => {
          if (!res.ok) throw new Error('Failed to delete hostel')
          return res.json()
        })
      )

      await Promise.all(deletePromises)

      // Update local state
      setCampusData(prev => prev.filter(c => c.id !== deleteModal.campus.id))
      setDeleteModal({ isOpen: false, campus: null })
      notify.success('Campus deleted successfully!')
    } catch (err) {
      console.error('Error deleting campus:', err)
      notify.error('Failed to delete campus: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle add campus
  const handleAddCampus = () => {
    setAddModal({ isOpen: true, newCampusData: { name: '' } })
  }

  // Handle save new campus
  const handleSaveNewCampus = async () => {
    if (!addModal.newCampusData.name.trim()) {
      notify.error('Campus name is required')
      return
    }

    try {
      setIsAdding(true)
      // Create a new hostel with the campus name
      const response = await fetch('/api/hostel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${addModal.newCampusData.name} - Hostel 1`,
          hostelCampus: addModal.newCampusData.name,
          block: 'A',
          floor: '1',
          location: 'Main Campus',
          genderRestriction: 'mixed',
          facilities: ['Basic'],
          description: `Hostel for ${addModal.newCampusData.name}`,
          rulesAndPolicies: 'Standard hostel policies'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create hostel')
      }

      const result = await response.json()

      // Refresh campus data
      setAddModal({ isOpen: false, newCampusData: { name: '' } })
      
      // Refetch data to include new campus
      if (isAuthenticated && token) {
        const [hostelsRes, roomsRes] = await Promise.all([
          fetch('/api/hostel', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/room', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (hostelsRes.ok && roomsRes.ok) {
          const hostelsData = await hostelsRes.json()
          const roomsData = await roomsRes.json()

          if (hostelsData.success) {
            const campuses = transformCampusData(hostelsData.data, roomsData.data || [])
            setCampusData(campuses)
          }
        }
      }

      notify.success('Campus created successfully!')
    } catch (err) {
      console.error('Error creating campus:', err)
      notify.error('Failed to create campus: ' + err.message)
    } finally {
      setIsAdding(false)
    }
  }

  // Filtered and sorted campuses
  const filteredAndSorted = useMemo(() => {
    let filtered = campusData.filter((campus) =>
      campus.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'hostels':
          return b.hostels.length - a.hostels.length
        case 'capacity':
          return b.totalCapacity - a.totalCapacity
        default:
          return 0
      }
    })

    return filtered
  }, [campusData, searchTerm, sortBy])

  // Reset to page 1 whenever the filtered/sorted result set changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy, campusData.length])

  const totalPages = Math.ceil(filteredAndSorted.length / CAMPUSES_PER_PAGE)
  const paginatedCampuses = filteredAndSorted.slice(
    (currentPage - 1) * CAMPUSES_PER_PAGE,
    currentPage * CAMPUSES_PER_PAGE
  )

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          icon={MapPin}
          title="Campus Management"
          subtitle="Manage hostels and allocations across campuses"
          actions={
            <button
              onClick={handleAddCampus}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
            >
              <Plus size={16} />
              Add Campus
            </button>
          }
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search campuses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="hostels">Sort by Hostels Count</option>
              <option value="capacity">Sort by Capacity</option>
            </select>
          </div>
        </div>

        {/* Campus Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : paginatedCampuses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCampuses.map((campus) => (
                <CampusCard
                  key={campus.id}
                  campus={campus}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteModal({ isOpen: true, campus })}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAndSorted.length}
              pageSize={CAMPUSES_PER_PAGE}
            />
          </>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No campuses found"
            message={searchTerm ? 'Try adjusting your search.' : 'Add a new campus to get started.'}
          />
        )}
      </div>

      {/* View Modal */}
      <ViewModal 
        isOpen={viewModal.isOpen}
        campus={viewModal.campus}
        onClose={() => setViewModal({ isOpen: false, campus: null })}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        campus={editModal.campus}
        editData={editModal.editData}
        onEditDataChange={(data) => setEditModal(prev => ({ ...prev, editData: data }))}
        onSave={handleSaveEdit}
        onClose={() => setEditModal({ isOpen: false, campus: null, editData: null })}
        isSaving={isSaving}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Campus"
        message={
          deleteModal.campus
            ? `Are you sure you want to delete "${deleteModal.campus.name}"? This will affect ${deleteModal.campus.hostels.length} hostel${deleteModal.campus.hostels.length !== 1 ? 's' : ''} and cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, campus: null })}
      />

      {/* Add Campus Modal */}
      <AddCampusModal
        isOpen={addModal.isOpen}
        newCampusData={addModal.newCampusData}
        onDataChange={(data) => setAddModal(prev => ({ ...prev, newCampusData: data }))}
        onSave={handleSaveNewCampus}
        onClose={() => setAddModal({ isOpen: false, newCampusData: { name: '' } })}
        isAdding={isAdding}
      />
    </div>
  )
}

// Campus Card Component
function CampusCard({ campus, onView, onEdit, onDelete }) {
  const occupancyRate = campus.totalCapacity > 0
    ? Math.round((campus.totalOccupancy / campus.totalCapacity) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-900 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-white/10 p-2 rounded-lg">
              <MapPin size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{campus.name}</h3>
              <p className="text-blue-100 text-sm mt-1">{campus.hostels.length} Hostel{campus.hostels.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Available Beds</p>
            <p className="text-2xl font-bold text-green-600">
              {campus.totalCapacity - campus.totalOccupancy}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Occupied Beds</p>
            <p className="text-2xl font-bold text-red-600">{campus.totalOccupancy}</p>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Occupancy Rate</span>
            <span className="text-sm font-bold text-gray-700">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-900 transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Hostel List */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Hostels</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {campus.hostels.slice(0, 3).map((hostel, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div className="flex items-start gap-2 text-xs mb-2">
                  <Building2 className="text-blue-900 flex-shrink-0 mt-0.5" size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{hostel.name}</p>
                    <p className="text-gray-500 text-xs">{hostel.block} • {hostel.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-100 rounded px-2 py-1 text-center">
                    <p className="text-xs text-gray-600 font-medium">Available</p>
                    <p className="text-sm font-bold text-green-700">{hostel.availableBeds || 0}</p>
                  </div>
                  <div className="flex-1 bg-red-100 rounded px-2 py-1 text-center">
                    <p className="text-xs text-gray-600 font-medium">Occupied</p>
                    <p className="text-sm font-bold text-red-700">{hostel.occupiedBeds || 0}</p>
                  </div>
                </div>
              </div>
            ))}
            {campus.hostels.length > 3 && (
              <p className="text-xs text-blue-900 font-medium">+{campus.hostels.length - 3} more</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-100 p-4 flex gap-2">
        <button
          onClick={() => onView(campus)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-900 bg-blue-900/5 rounded-lg hover:bg-blue-900/10 transition-colors"
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={() => onEdit(campus)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit2 size={16} />
          Edit
        </button>
        <button
          onClick={() => onDelete()}
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

// View Modal Component
function ViewModal({ isOpen, campus, onClose }) {
  if (!isOpen || !campus) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold">{campus.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campus Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-gray-600 font-medium mb-2">HOSTELS</p>
              <p className="text-3xl font-bold text-blue-900">{campus.hostels.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 font-medium mb-2">AVAILABLE BEDS</p>
              <p className="text-3xl font-bold text-green-600">{campus.totalCapacity - campus.totalOccupancy}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-xs text-gray-600 font-medium mb-2">OCCUPIED BEDS</p>
              <p className="text-3xl font-bold text-red-600">{campus.totalOccupancy}</p>
            </div>
          </div>

          {/* Hostels List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hostels in {campus.name}</h3>
            <div className="space-y-3">
              {campus.hostels.map((hostel, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="text-blue-900 flex-shrink-0 mt-1" size={20} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{hostel.name}</h4>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600 flex-wrap">
                        <p><span className="font-medium">Block:</span> {hostel.block}</p>
                        <p><span className="font-medium">Floor:</span> {hostel.floor}</p>
                        <p><span className="font-medium">Location:</span> {hostel.location}</p>
                      </div>
                      {hostel.genderRestriction && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Gender:</span> {hostel.genderRestriction}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-100 rounded p-2 text-center">
                      <p className="text-xs text-gray-600 font-medium">Available Beds</p>
                      <p className="text-lg font-bold text-green-700">{hostel.availableBeds || 0}</p>
                    </div>
                    <div className="bg-red-100 rounded p-2 text-center">
                      <p className="text-xs text-gray-600 font-medium">Occupied Beds</p>
                      <p className="text-lg font-bold text-red-700">{hostel.occupiedBeds || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-6">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Modal Component
function EditModal({ isOpen, campus, editData, onEditDataChange, onSave, onClose, isSaving }) {
  if (!isOpen || !campus || !editData) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Campus</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-white hover:bg-white/10 p-2 rounded-full transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campus Name</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              disabled={isSaving}
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-600"><span className="font-medium">Hostels:</span> {campus.hostels.length}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Available Beds:</span> {campus.totalCapacity - campus.totalOccupancy}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
          >
            {isSaving && <Loader size={18} className="animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Campus Modal Component
function AddCampusModal({ isOpen, newCampusData, onDataChange, onSave, onClose, isAdding }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <MapPin size={24} />
            </div>
            <h2 className="text-xl font-bold">Add New Campus</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isAdding}
            className="text-white hover:bg-white/10 p-2 rounded-full transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campus Name</label>
            <input
              type="text"
              placeholder="e.g., Main Campus, North Campus, South Campus"
              value={newCampusData.name}
              onChange={(e) => onDataChange({ ...newCampusData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              disabled={isAdding}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">Enter a unique name for your new campus.</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> A default hostel will be created with this campus.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isAdding}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isAdding || !newCampusData.name.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
          >
            {isAdding && <Loader size={18} className="animate-spin" />}
            {isAdding ? 'Creating...' : 'Create Campus'}
          </button>
        </div>
      </div>
    </div>
  )
}
