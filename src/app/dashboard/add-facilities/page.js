'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Loader2, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import { notify } from '@/components/dashboard-component/ui/toast'

export default function AddFacilitiesPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    status: 'active',
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.category) {
      notify.error('All fields are required')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/facility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create facility')

      notify.success('Facility created successfully')
      setFormData({ name: '', category: '', location: '', status: 'active' })
    } catch (err) {
      notify.error(err.message || 'Failed to create facility')
    } finally {
      setLoading(false)
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
        icon={Building2}
        title="Add Facility"
        subtitle="Create a new facility"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Central Air Conditioning Unit"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Block A, Ground Floor"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="in-use">In Use</option>
                <option value="damage">Damage</option>
                <option value="under-repair">Under Repair</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || fetchLoading}
            className="w-full inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60 justify-center"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? 'Creating...' : 'Create Facility'}
          </button>
        </form>
      </div>
    </div>
  )
}
