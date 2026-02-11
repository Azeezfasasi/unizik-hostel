'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, ArrowUp, ArrowDown } from 'lucide-react'

export default function TestimonialContent() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

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
      setError('Please fill in all required fields')
      return
    }

    setError('')
    setSaving(true)

    try {
      const method = testimonial._id ? 'PUT' : 'POST'
      const url = testimonial._id ? `/api/testimonial/${testimonial._id}` : '/api/testimonial'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial)
      })

      const result = await res.json()

      if (result.success) {
        setSuccess('Testimonial saved successfully!')
        await fetchTestimonials()
        setEditingId(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save testimonial')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!id) {
      setError('Cannot delete unsaved testimonial. Please save first.')
      return
    }

    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/testimonial/${id}`, { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        setSuccess('Testimonial deleted successfully!')
        await fetchTestimonials()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to delete')
      }
    } catch (err) {
      setError('Failed to delete testimonial')
      console.error(err)
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
          })
        } catch (err) {
          console.error('Error updating order:', err)
        }
      }
    }
  }

  if (loading) {
    return <div className="p-6"><p className="text-gray-600">Loading...</p></div>
  }

  return (
    <div className="p-0 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-[24px] md:text-3xl font-bold text-gray-900 mb-6">Testimonials Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Add New Testimonial Button */}
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
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
      >
        <Plus size={20} /> Add Testimonial
      </button>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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
                    <div className="flex gap-1 text-yellow-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {index > 0 && (
                    <button
                      onClick={() => moveOrder(index, 'up')}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      title="Move up"
                    >
                      <ArrowUp size={18} />
                    </button>
                  )}
                  {index < testimonials.length - 1 && (
                    <button
                      onClick={() => moveOrder(index, 'down')}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      title="Move down"
                    >
                      <ArrowDown size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(index)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {testimonials.length === 0 && !loading && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No testimonials yet</p>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} /> Add First Testimonial
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
