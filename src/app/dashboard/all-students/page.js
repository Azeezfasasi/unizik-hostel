'use client'

import React, { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, Eye, EyeOff, Plus, Users, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import { notify } from '@/components/dashboard-component/ui/toast'

const PAGE_SIZE = 10

export default function ManageAllStudents() {
  const { token } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view' or 'edit'
  const [editForm, setEditForm] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [page, setPage] = useState(1)

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) return
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
          notify.error('Failed to fetch students')
        }
      } catch (err) {
        console.error('Error fetching students:', err)
        notify.error(err.message || 'Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStudents()
    }
  }, [token])

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = students.filter(s =>
        s.firstName?.toLowerCase().includes(term) ||
        s.lastName?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.matricNumber?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term)
      )
      setFilteredStudents(filtered)
    }
    setPage(1)
  }, [searchTerm, students])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const paginatedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      setSaveLoading(true)

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
      notify.success('Student updated successfully')
      setShowModal(false)
    } catch (err) {
      notify.error(err.message || 'Failed to update student')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!confirmDelete) return
    try {
      setDeleteLoading(true)

      const res = await fetch(`/api/users/${confirmDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete student')

      setStudents(students.filter(s => s._id !== confirmDelete._id))
      notify.success('Student deleted successfully')
      setConfirmDelete(null)
    } catch (err) {
      notify.error(err.message || 'Failed to delete student')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
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
      notify.success('Student status updated successfully')
    } catch (err) {
      notify.error(err.message || 'Failed to update student status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin']}>
      <div className="max-w-7xl mx-auto space-y-6 mt-4 md:mt-8">
        <PageHeader
          icon={Users}
          title="Manage Students"
          subtitle="View and manage all student accounts"
          actions={
            <button
              onClick={() => router.push('/dashboard/add-students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Student
            </button>
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-emerald-500">
            <p className="text-gray-500 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{students.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-red-500">
            <p className="text-gray-500 text-sm font-medium">Inactive</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{students.filter(s => !s.isActive).length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">Search Students</h2>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, matric number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
          />
        </div>

        {/* Students Table */}
        {loading ? (
          <PageSpinner label="Loading students..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState title="No students found" message="Try adjusting your search." />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Matric #</th>
                      <th className="px-6 py-3 text-left">Phone</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">{student.otherName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.matricNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={student.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-6 py-4 text-sm space-x-1">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(student._id, student.isActive)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            {student.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(student)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              {paginatedStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <StatusBadge status={student.isActive ? 'active' : 'inactive'} />
                  </div>

                  <div className="space-y-1 mb-3 text-sm">
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Matric #:</span> {student.matricNumber || '-'}</p>
                    <p className="text-gray-600"><span className="font-medium text-gray-900">Phone:</span> {student.phone || '-'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStudentStatus(student._id, student.isActive)}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      {student.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(student)}
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
              totalItems={filteredStudents.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}

        {/* Student View/Edit Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-base font-semibold text-gray-900">
                  {modalMode === 'view' ? 'Student Details' : 'Edit Student'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.firstName}</p>
                    ) : (
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.lastName}</p>
                    ) : (
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.otherName || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={editForm.otherName || ''}
                        onChange={(e) => setEditForm({...editForm, otherName: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.email}</p>
                    ) : (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.matricNumber || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={editForm.matricNumber || ''}
                        onChange={(e) => setEditForm({...editForm, matricNumber: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.phone || '-'}</p>
                    ) : (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.dob || '-'}</p>
                    ) : (
                      <input
                        type="date"
                        value={editForm.dob || ''}
                        onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {modalMode === 'view' ? (
                      <p className="px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm">{editForm.gender || '-'}</p>
                    ) : (
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
          title="Delete Student"
          message={confirmDelete ? `Are you sure you want to delete ${confirmDelete.firstName} ${confirmDelete.lastName}? This action cannot be undone.` : ''}
          confirmLabel="Delete"
          tone="danger"
          isLoading={deleteLoading}
          onConfirm={handleDeleteStudent}
          onClose={() => setConfirmDelete(null)}
        />
      </div>
    </ProtectedRoute>
  )
}
