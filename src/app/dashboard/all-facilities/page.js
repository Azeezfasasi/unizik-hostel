'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, Search, Pencil, Trash2, X, Wrench } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import { notify } from '@/components/dashboard-component/ui/toast'

const PAGE_SIZE = 9

export default function AllFacilitiesPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', location: '', status: 'active' })
  const [editLoading, setEditLoading] = useState(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  const fetchFacilities = async () => {
    if (!isAuthenticated || !token) return
    try {
      setLoading(true)
      const res = await fetch('/api/facility', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch facilities')
      const data = await res.json()
      setFacilities(data.data || [])
    } catch (err) {
      notify.error(err.message || 'Failed to load facilities')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!isAuthenticated || !token) return
    try {
      const res = await fetch('/api/facility-category', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFacilities()
      fetchCategories()
    }
  }, [isAuthenticated, token])

  const filteredFacilities = useMemo(() => {
    let list = filter === 'all' ? facilities : facilities.filter(f => f.status === filter)
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(f =>
        f.name?.toLowerCase().includes(term) ||
        f.location?.toLowerCase().includes(term) ||
        (f.category?.name || '').toLowerCase().includes(term)
      )
    }
    return list
  }, [facilities, filter, search])

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  const totalPages = Math.max(1, Math.ceil(filteredFacilities.length / PAGE_SIZE))
  const paginatedFacilities = filteredFacilities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openEdit = (facility) => {
    setEditTarget(facility)
    setEditForm({
      name: facility.name || '',
      category: facility.category?._id || facility.category || '',
      location: facility.location || '',
      status: facility.status || 'active',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editTarget) return
    if (!editForm.name.trim() || !editForm.category) {
      notify.error('Name and category are required')
      return
    }
    try {
      setEditLoading(true)
      const res = await fetch(`/api/facility/${editTarget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update facility')

      setFacilities(prev => prev.map(f => (f._id === editTarget._id ? data.data : f)))
      notify.success('Facility updated successfully')
      setEditTarget(null)
    } catch (err) {
      notify.error(err.message || 'Failed to update facility')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setDeleteLoading(true)
      const res = await fetch(`/api/facility/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete facility')

      setFacilities(prev => prev.filter(f => f._id !== deleteTarget._id))
      notify.success('Facility deleted successfully')
      setDeleteTarget(null)
    } catch (err) {
      notify.error(err.message || 'Failed to delete facility')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Wrench}
        title="All Facilities"
        subtitle="Manage facilities and view damage reports"
      />

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facilities by name, location, or category..."
            className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'damage', 'under-repair', 'in-use', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <PageSpinner label="Loading facilities..." />
      ) : filteredFacilities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFacilities.map(facility => (
              <div key={facility._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <h3 className="text-base font-semibold text-gray-900 flex-1">{facility.name}</h3>
                  <StatusBadge status={facility.status} />
                </div>

                <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                  {facility.category && (
                    <p><span className="font-medium text-gray-700">Category:</span> {facility.category.name || facility.category}</p>
                  )}
                  {facility.location && (
                    <p><span className="font-medium text-gray-700">Location:</span> {facility.location}</p>
                  )}
                </div>

                {facility.damageReports && facility.damageReports.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <p className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      Damage Reports ({facility.damageReports.length})
                    </p>
                    <div className="space-y-2">
                      {facility.damageReports.slice(0, 2).map((report, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">{new Date(report.reportedAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-700">{report.description.substring(0, 60)}...</p>
                          <p className="text-xs font-medium mt-1">
                            <span className="text-red-600">Status:</span> {report.repairStatus}
                          </p>
                        </div>
                      ))}
                      {facility.damageReports.length > 2 && (
                        <p className="text-xs text-gray-500">+{facility.damageReports.length - 2} more reports</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(facility)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(facility)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-gray-200 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
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
            totalItems={filteredFacilities.length}
            pageSize={PAGE_SIZE}
          />
        </>
      ) : (
        <EmptyState title="No facilities found" message="Try adjusting your search or filters." />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && setEditTarget(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Edit Facility</h3>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="in-use">In Use</option>
                  <option value="damage">Damage</option>
                  <option value="under-repair">Under Repair</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Facility"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
