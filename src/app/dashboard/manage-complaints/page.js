'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Search, Edit2, Trash2, Eye, X, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ManageComplaints() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view')
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

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
          setError('Failed to fetch complaints')
        }
      } catch (err) {
        console.error('Error fetching complaints:', err)
        setError(err.message)
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
  }, [searchTerm, statusFilter, categoryFilter, complaints])

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
      setLoading(true)
      setError(null)

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
      setSuccess(true)
      setShowModal(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update complaint')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComplaint = async (complaintId) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete complaint')

      setComplaints(complaints.filter(c => c._id !== complaintId))
      setSuccess(true)
      setConfirmDelete(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to delete complaint')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-gray-100 text-gray-800'
      case 'In-Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Complaints</h1>
              <p className="text-gray-600 mt-1">View and manage all student complaints</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/send-complaint')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={20} />
              New Complaint
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm font-medium">Open</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">{complaints.filter(c => c.status === 'Open').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{complaints.filter(c => c.status === 'In-Progress').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{complaints.filter(c => c.status === 'Resolved').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700">Operation completed successfully!</p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No complaints found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredComplaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{complaint.studentName}</p>
                          <p className="text-xs text-gray-500">{complaint.studentEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{complaint.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <p className="line-clamp-2">{complaint.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {complaint.assignedToName || <span className="text-gray-400">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleViewComplaint(complaint)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditComplaint(complaint)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(complaint)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
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
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{complaint.studentName}</p>
                      <p className="text-xs text-gray-500">{complaint.studentEmail}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3 text-sm">
                    <p className="text-gray-600"><span className="font-medium">Category:</span> {complaint.category}</p>
                    <p className="text-gray-600"><span className="font-medium">Priority:</span> <span className={`px-2 py-0 rounded text-xs ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span></p>
                    <p className="text-gray-600"><span className="font-medium">Description:</span> {complaint.description.substring(0, 50)}...</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewComplaint(complaint)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditComplaint(complaint)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(complaint)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View/Edit Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'view' ? 'Complaint Details' : 'Edit Complaint'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded text-sm">{editForm.studentEmail}</p>
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.location}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {modalMode === 'view' ? (
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded whitespace-pre-wrap">{editForm.description}</p>
                ) : (
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <p className="px-3 py-2 bg-gray-50 rounded">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(editForm.status)}`}>
                        {editForm.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <p className="px-3 py-2 bg-gray-50 rounded">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(editForm.priority)}`}>
                        {editForm.priority}
                      </span>
                    </p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.assignedToName || 'Unassigned'}</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">
                  {new Date(editForm.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t p-6 flex gap-3">
              {modalMode === 'edit' && (
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Complaint</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this complaint from <span className="font-semibold">{confirmDelete.studentName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteComplaint(confirmDelete._id)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

