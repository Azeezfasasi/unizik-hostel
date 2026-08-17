'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, ArrowUp, ArrowDown, MessageSquareQuote, Star } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { notify } from '@/components/dashboard-component/ui/toast'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'

function TestimonialContentInner() {
  const { token } = useAuth()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/testimonial?includeInactive=true')
      const result = await res.json()
      if (result.success) {
        setTestimonials(result.data || [])
      } else {
        setError('Failed to load testimonials')
      }
    } catch (err) {
      setError('Failed to fetch testimonials')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (testimonial) => {
    if (!testimonial.name || !testimonial.position || !testimonial.message) {
      notify.error('Please fill in all required fields')
      return
    }

    setError('')
    setSaving(true)

    try {
      const method = testimonial._id ? 'PUT' : 'POST'
      const url = testimonial._id ? `/api/testimonial/${testimonial._id}` : '/api/testimonial'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testimonial)
      })

      const result = await res.json()

      if (result.success) {
        notify.success('Testimonial saved successfully!')
        await fetchTestimonials()
        setEditingId(null)
      } else {
        notify.error(result.error || 'Failed to save')
      }
    } catch (err) {
      notify.error('Failed to save testimonial')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (testimonial) => {
    if (!testimonial._id) {
      notify.error('Cannot delete unsaved testimonial. Please save first.')
      return
    }
    setDeleteTarget(testimonial)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/testimonial/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()

      if (result.success) {
        notify.success('Testimonial deleted successfully!')
        await fetchTestimonials()
        setDeleteTarget(null)
      } else {
        notify.error(result.error || 'Failed to delete')
      }
    } catch (err) {
      notify.error('Failed to delete testimonial')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const moveOrder = async (index, direction) => {
    const newTestimonials = [...testimonials]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newTestimonials.length) return

    // Check if both testimonials have IDs (are saved)
    if (!newTestimonials[index]._id || !newTestimonials[newIndex]._id) {
      setError('Cannot reorder unsaved testimonials. Please save all testimonials first.')
      return
    }

    const temp = newTestimonials[index]
    newTestimonials[index] = newTestimonials[newIndex]
    newTestimonials[newIndex] = temp

    // Update order values
    newTestimonials.forEach((t, i) => {
      t.order = i
    })

    setTestimonials(newTestimonials)

    // Save all changes - only for saved testimonials
    for (const t of newTestimonials) {
      if (t._id) {
        try {
          await fetch(`/api/testimonial/${t._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(t)
          })
        } catch (err) {
          console.error('Error updating order:', err)
        }
      }
    }
  }

  if (loading) {
    return <PageSpinner label="Loading testimonials..." />
  }

  return (
    <div className="p-0 md:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={MessageSquareQuote}
        title="Testimonials Management"
        subtitle="Manage the testimonials shown on the homepage"
        actions={
          <button
            onClick={() => {
              const newTestimonial = {
                name: '',
                position: '',
                message: '',
                rating: 5,
                order: testimonials.length,
                isActive: true
              }
              setTestimonials([...testimonials, newTestimonial])
              setEditingId(testimonials.length)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Testimonial
          </button>
        }
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {editingId === index ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].name = e.target.value
                        setTestimonials(newTestimonials)
                      }}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title *</label>
                    <input
                      type="text"
                      value={testimonial.position}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].position = e.target.value
                        setTestimonials(newTestimonials)
                      }}
                      maxLength={150}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={testimonial.message}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials]
                      newTestimonials[index].message = e.target.value
                      setTestimonials(newTestimonials)
                    }}
                    maxLength={500}
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">{testimonial.message?.length || 0}/500</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <select
                      value={testimonial.rating}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].rating = parseInt(e.target.value)
                        setTestimonials(newTestimonials)
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    >
                      {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                    <input
                      type="checkbox"
                      checked={testimonial.isActive}
                      onChange={(e) => {
                        const newTestimonials = [...testimonials]
                        newTestimonials[index].isActive = e.target.checked
                        setTestimonials(newTestimonials)
                      }}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleSave(testimonial)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-gray-700 mt-2 italic">"{testimonial.message}"</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${testimonial.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  {index > 0 && (
                    <button
                      onClick={() => moveOrder(index, 'up')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                  )}
                  {index < testimonials.length - 1 && (
                    <button
                      onClick={() => moveOrder(index, 'down')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(index)}
                    className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(testimonial)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {testimonials.length === 0 && !loading && (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials yet"
            message="Add your first testimonial to display it on the homepage."
            action={
              <button
                onClick={() => {
                  const newTestimonial = {
                    name: '',
                    position: '',
                    message: '',
                    rating: 5,
                    order: 0,
                    isActive: true
                  }
                  setTestimonials([newTestimonial])
                  setEditingId(0)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add First Testimonial
              </button>
            }
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete testimonial?"
        message={`Are you sure you want to delete the testimonial from "${deleteTarget?.name || 'this person'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function TestimonialContent() {
  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin']}>
      <TestimonialContentInner />
    </ProtectedRoute>
  )
}
