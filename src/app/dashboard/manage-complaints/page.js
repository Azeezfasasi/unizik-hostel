'use client'

import React, { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, Eye, X, Plus, MessageSquareWarning } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import { notify } from '@/components/dashboard-component/ui/toast'

const PAGE_SIZE = 10

export default function ManageComplaints() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view')
  const [editForm, setEditForm] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [page, setPage] = useState(1)

  const isAdmin = user?.role === 'admin' || user?.role === 'super admin'

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, isAdmin, router])

  // Fetch staff/admin users
  useEffect(() => {
    const fetchStaffUsers = async () => {
      if (!isAuthenticated || !token) return
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const staff = (data.users || data.data || []).filter(u =>
            u.role === 'staff' || u.role === 'admin' || u.role === 'super admin'
          )
          setStaffUsers(staff)
        }
      } catch (err) {
        console.error('Error fetching staff users:', err)
      }
    }

    if (isAuthenticated && token) {
      fetchStaffUsers()
    }
  }, [isAuthenticated, token])

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!isAuthenticated || !token) return
      try {
        setLoading(true)
        const res = await fetch('/api/complaints', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setComplaints(data.data || [])
          setFilteredComplaints(data.data || [])
        } else {
          notify.error('Failed to fetch complaints')
        }
      } catch (err) {
        console.error('Error fetching complaints:', err)
        notify.error(err.message || 'Failed to fetch complaints')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token && isAdmin) {
      fetchComplaints()
    }
  }, [isAuthenticated, token, isAdmin])

  // Apply filters
  useEffect(() => {
    let filtered = complaints

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.studentName?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term)
      )
    }

    setFilteredComplaints(filtered)
    setPage(1)
  }, [searchTerm, statusFilter, categoryFilter, complaints])

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / PAGE_SIZE))
  const paginatedComplaints = filteredComplaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint)
    setEditForm(complaint)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditComplaint = (complaint) => {
    setSelectedComplaint(complaint)
    setEditForm({ ...complaint })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedComplaint) return

    try {
      setSaveLoading(true)

      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editForm.status,
          assignedTo: editForm.assignedTo,
          assignedToName: editForm.assignedToName,
          priority: editForm.priority,
          resolution: editForm.resolution,
          resolutionDate: editForm.resolutionDate
        })
      })

      if (!res.ok) throw new Error('Failed to update complaint')

      const data = await res.json()
      setComplaints(complaints.map(c => c._id === selectedComplaint._id ? data.data : c))
      notify.success('Complaint updated successfully')
      setShowModal(false)
    } catch (err) {
      notify.error(err.message || 'Failed to update complaint')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteComplaint = async () => {
    if (!confirmDelete) return
    try {
      setDeleteLoading(true)
      const res = await fetch(`/api/complaints/${confirmDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete complaint')

      setComplaints(complaints.filter(c => c._id !== confirmDelete._id))
      notify.success('Complaint deleted successfully')
      setConfirmDelete(null)
    } catch (err) {
      notify.error(err.message || 'Failed to delete complaint')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={MessageSquareWarning}
        title="Manage Complaints"
        subtitle="View and manage all student complaints"
        actions={
          <button
            onClick={() => router.push('/dashboard/send-complaint')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Complaint
          </button>
        }
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-gray-500 text-sm font-medium">Total Complaints</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-gray-400">
          <p className="text-gray-500 text-sm font-medium">Open</p>
          <p className="text-3xl font-bold text-gray-700 mt-2">{complaints.filter(c => c.status === 'Open').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-amber-500">
          <p className="text-gray-500 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{complaints.filter(c => c.status === 'In-Progress').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{complaints.filter(c => c.status === 'Resolved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="all">All</option>
              <option value="Open">Open</option>
              <option value="In-Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="all">All</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Electricity">Electricity</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Security">Security</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Noise">Noise</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <PageSpinner label="Loading complaints..." />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState title="No complaints found" message="Try adjusting your search or filters." />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Priority</th>
                    <th className="px-6 py-3 text-left">Assigned To</th>
                    <th className="px-6 py-3 text-left">Created</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{complaint.studentName}</p>
                        <p className="text-xs text-gray-500">{complaint.studentEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{complaint.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p className="line-clamp-2 max-w-xs">{complaint.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complaint.assignedToName || <span className="text-gray-400">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-1">
                        <button
                          onClick={() => handleViewComplaint(complaint)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditComplaint(complaint)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(complaint)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {paginatedComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{complaint.studentName}</p>
                    <p className="text-xs text-gray-500">{complaint.studentEmail}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <div className="space-y-1 mb-3 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Category:</span> {complaint.category}</p>
                  <p className="text-gray-600"><span className="font-medium">Priority:</span> <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span></p>
                  <p className="text-gray-600"><span className="font-medium">Description:</span> {complaint.description.substring(0, 50)}...</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewComplaint(complaint)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditComplaint(complaint)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(complaint)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredComplaints.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

      {/* View/Edit Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base font-semibold text-gray-900">
                {modalMode === 'view' ? 'Complaint Details' : 'Edit Complaint'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.studentEmail}</p>
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.location}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {modalMode === 'view' ? (
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm whitespace-pre-wrap">{editForm.description}</p>
                ) : (
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                )}
              </div>

              {/* Status & Priority */}
              {modalMode === 'edit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    >
                      <option value="Open">Open</option>
                      <option value="In-Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              )}

              {modalMode === 'view' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg">
                      <StatusBadge status={editForm.status} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(editForm.priority)}`}>
                        {editForm.priority}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned To */}
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={editForm.assignedTo || ''}
                    onChange={(e) => {
                      const selectedStaff = staffUsers.find(s => s._id === e.target.value)
                      setEditForm({
                        ...editForm,
                        assignedTo: e.target.value,
                        assignedToName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : ''
                      })
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  >
                    <option value="">-- Select Staff Member --</option>
                    {staffUsers.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName} ({staff.role === 'super admin' ? 'Super Admin' : staff.role.charAt(0).toUpperCase() + staff.role.slice(1)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modalMode === 'view' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.assignedToName || 'Unassigned'}</p>
                </div>
              )}

              {/* Resolution (Edit Mode) */}
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                  <textarea
                    value={editForm.resolution || ''}
                    onChange={(e) => setEditForm({ ...editForm, resolution: e.target.value })}
                    placeholder="Describe how the complaint was resolved..."
                    rows="3"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
              )}

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">
                  {new Date(editForm.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5 flex gap-3">
              {modalMode === 'edit' && (
                <button
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Complaint"
        message={confirmDelete ? `Are you sure you want to delete this complaint from ${confirmDelete.studentName}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteLoading}
        onConfirm={handleDeleteComplaint}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}
