'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Tags } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner, TableSkeleton } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import { notify } from '@/components/dashboard-component/ui/toast'

export default function AddFacilityCategoryPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isAuthenticated || !token) return
      try {
        setFetchLoading(true)
        const res = await fetch('/api/facility-category', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCategories(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setFetchLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchCategories()
    }
  }, [isAuthenticated, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      notify.error('Category name is required')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/facility-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Failed to create category')

      setCategoryName('')
      setCategories([...categories, data.data])
      notify.success('Category created successfully')
    } catch (err) {
      notify.error(err.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setDeleteLoading(true)
      const res = await fetch(`/api/facility-category/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete category')

      setCategories(categories.filter(c => c._id !== deleteTarget._id))
      notify.success('Category deleted successfully')
      setDeleteTarget(null)
    } catch (err) {
      notify.error(err.message || 'Failed to delete category')
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
    <div className="max-w-4xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Tags}
        title="Facility Categories"
        subtitle="Create and manage facility categories"
      />

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Air Conditioning, Water System, Electrical"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Categories ({categories.length})</h2>
        </div>

        {fetchLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={3} />
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Category Name</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="No categories found" message="Create one to get started!" />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
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
