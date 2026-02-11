'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Search, Edit2, Trash2, Eye, EyeOff, Filter, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ManageAllStudents() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view' or 'edit'
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isAuthenticated || !token) return
      try {
        setLoading(true)
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          // Filter for students only
          const studentsList = (data.users || data.data || []).filter(u => u.role === 'student')
          setStudents(studentsList)
          setFilteredStudents(studentsList)
        } else {
          setError('Failed to fetch students')
        }
      } catch (err) {
        console.error('Error fetching students:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchStudents()
    }
  }, [isAuthenticated, token])

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = students.filter(s =>
      s.firstName?.toLowerCase().includes(term) ||
      s.lastName?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.matricNumber?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term)
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setEditForm(student)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setEditForm({ ...student })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStudent) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) throw new Error('Failed to update student')

      // Update local state
      setStudents(students.map(s => s._id === selectedStudent._id ? editForm : s))
      setSuccess(true)
      setShowModal(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete student')

      setStudents(students.filter(s => s._id !== studentId))
      setSuccess(true)
      setConfirmDelete(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to delete student')
    } finally {
      setLoading(false)
    }
  }

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!res.ok) throw new Error('Failed to update student status')

      // Update local state
      setStudents(students.map(s => s._id === studentId ? { ...s, isActive: !currentStatus } : s))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update student status')
    } finally {
      setLoading(false)
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

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
              <p className="text-gray-600 mt-1">View and manage all student accounts</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/add-students')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{students.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Inactive</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{students.filter(s => !s.isActive).length}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Search Students</h2>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, matric number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

        {/* Students Table - Desktop */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No students found</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Matric #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-500">{student.otherName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.matricNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(student._id, student.isActive)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          >
                            {student.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(student)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} /> Delete
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
              {filteredStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3 text-sm">
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Matric #:</span> {student.matricNumber || '-'}</p>
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Phone:</span> {student.phone || '-'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStudentStatus(student._id, student.isActive)}
                      className="flex-1 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                    >
                      {student.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(student)}
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

      {/* Student View/Edit Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'view' ? 'Student Details' : 'Edit Student'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.firstName}</p>
                  ) : (
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.lastName}</p>
                  ) : (
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.otherName || '-'}</p>
                  ) : (
                    <input
                      type="text"
                      value={editForm.otherName || ''}
                      onChange={(e) => setEditForm({...editForm, otherName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.email}</p>
                  ) : (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.matricNumber || '-'}</p>
                  ) : (
                    <input
                      type="text"
                      value={editForm.matricNumber || ''}
                      onChange={(e) => setEditForm({...editForm, matricNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.phone || '-'}</p>
                  ) : (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.dob || '-'}</p>
                  ) : (
                    <input
                      type="date"
                      value={editForm.dob || ''}
                      onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {modalMode === 'view' ? (
                    <p className="px-3 py-2 bg-gray-50 text-gray-900 rounded">{editForm.gender || '-'}</p>
                  ) : (
                    <select
                      value={editForm.gender || ''}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{confirmDelete.firstName} {confirmDelete.lastName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteStudent(confirmDelete._id)}
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
