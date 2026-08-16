'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff, ArrowUpDown, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { notify } from '@/components/dashboard-component/ui/toast'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { TableSkeleton } from '@/components/dashboard-component/ui/Skeleton'

function HeroContentInner() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta: { label: '', href: '' },
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    image: { src: '', alt: '' },
    order: 0,
    isActive: true
  })
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch slides on mount
  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hero?includeInactive=true')
      const result = await res.json()
      if (result.success) {
        setSlides(result.data)
      }
    } catch (err) {
      setError('Failed to fetch hero slides')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formDataForUpload = new FormData()
      formDataForUpload.append('file', file)
      formDataForUpload.append('folder', 'cananusa/hero-slider')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataForUpload
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({
          ...prev,
          image: {
            ...prev.image,
            src: result.secure_url
          }
        }))
        notify.success('Image uploaded successfully')
      } else {
        const error = await response.json()
        notify.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      notify.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (name === 'order' ? Number(value) : value)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title || !formData.subtitle || !formData.cta.label || !formData.cta.href) {
      notify.error('Please fill in all required fields')
      return
    }

    try {
      const url = editingId ? `/api/hero/${editingId}` : '/api/hero'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (result.success) {
        notify.success(editingId ? 'Slide updated successfully' : 'Slide created successfully')
        fetchSlides()
        resetForm()
        setShowForm(false)
      } else {
        notify.error(result.error || 'Operation failed')
      }
    } catch (err) {
      notify.error('Failed to save slide')
      console.error(err)
    }
  }

  const handleEdit = (slide) => {
    setFormData(slide)
    setEditingId(slide._id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDeleteClick = (slide) => {
    setDeleteTarget(slide)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/hero/${deleteTarget._id}`, { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        notify.success('Slide deleted successfully')
        fetchSlides()
        setDeleteTarget(null)
      } else {
        notify.error(result.error || 'Failed to delete slide')
      }
    } catch (err) {
      notify.error('Failed to delete slide')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (slide) => {
    try {
      const res = await fetch(`/api/hero/${slide._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive })
      })

      const result = await res.json()
      if (result.success) {
        fetchSlides()
      }
    } catch (err) {
      notify.error('Failed to toggle slide visibility')
      console.error(err)
    }
  }

  const handleReorder = async (id, newOrder) => {
    try {
      const res = await fetch(`/api/hero/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      })

      const result = await res.json()
      if (result.success) {
        fetchSlides()
      }
    } catch (err) {
      notify.error('Failed to reorder slide')
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta: { label: '', href: '' },
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      image: { src: '', alt: '' },
      order: 0,
      isActive: true
    })
    setEditingId(null)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={ImageIcon}
          title="Hero Slider Management"
          subtitle="Manage the rotating slides shown on the homepage hero section"
          actions={
            <button
              onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus size={18} /> {showForm ? 'Cancel' : 'Add Slide'}
            </button>
          }
        />

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6 overflow-x-hidden">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 break-words">
              {editingId ? 'Edit Slide' : 'Create New Slide'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Slide title"
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    min={0}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle *
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                  placeholder="Slide subtitle/description"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* CTA Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Button Label *
                  </label>
                  <input
                    type="text"
                    name="cta.label"
                    value={formData.cta.label}
                    onChange={handleFormChange}
                    placeholder="e.g., Join Now"
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>

                {/* CTA Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Link *
                  </label>
                  <input
                    type="text"
                    name="cta.href"
                    value={formData.cta.href}
                    onChange={handleFormChange}
                    // readOnly
                    placeholder="e.g., /join-us"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background (Gradient or Color)
                </label>
                <input
                  type="text"
                  name="bg"
                  value={formData.bg}
                  onChange={handleFormChange}
                  placeholder="e.g., linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition overflow-x-auto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <label className="flex items-center justify-center px-3 py-3 sm:py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>

                {/* Or Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Image URL
                  </label>
                  <input
                    type="text"
                    name="image.src"
                    value={formData.image.src}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">Leave empty or paste URL directly</p>
                </div>
              </div>

              {/* Image Preview */}
              {formData.image.src && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                  <img
                    src={formData.image.src}
                    alt={formData.image.alt || 'Slide preview'}
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png'
                    }}
                  />
                </div>
              )}

              {/* Image Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  name="image.alt"
                  value={formData.image.alt}
                  onChange={handleFormChange}
                  placeholder="Describe the image"
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                  Active (Show in hero slider)
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false) }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                >
                  {editingId ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Slides List */}
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : slides.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No slides yet"
            message="Create one to get started!"
          />
        ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 sm:px-6 py-3 text-left">Order</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left">CTA</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {
                  slides.map((slide) => (
                    <tr key={slide._id} className="hover:bg-gray-50/60">
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReorder(slide._id, Math.max(0, slide.order - 1))}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Move up"
                          >
                            <ArrowUpDown size={14} className="rotate-180" />
                          </button>
                          <span className="px-2">{slide.order}</span>
                          <button
                            onClick={() => handleReorder(slide._id, slide.order + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Move down"
                          >
                            <ArrowUpDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 max-w-xs truncate">
                        {slide.title}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        {slide.cta.label}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm">
                        <button
                          onClick={() => handleToggleActive(slide)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            slide.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {slide.isActive ? (
                            <>
                              <Eye size={12} /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm flex gap-1">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(slide)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {
              slides.map((slide) => (
                <div key={slide._id} className="p-4 hover:bg-gray-50/60">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{slide.title}</p>
                      <p className="text-xs text-gray-600 mt-1">CTA: {slide.cta.label}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                        slide.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {slide.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <p className="text-gray-600">Order</p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleReorder(slide._id, Math.max(0, slide.order - 1))}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Move up"
                        >
                          <ArrowUpDown size={12} className="rotate-180" />
                        </button>
                        <span className="font-medium">{slide.order}</span>
                        <button
                          onClick={() => handleReorder(slide._id, slide.order + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Move down"
                        >
                          <ArrowUpDown size={12} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium mt-1">{slide.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="flex-1 px-2 py-2 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(slide)}
                      className="flex-1 px-2 py-2 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        )}

        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete slide?"
          message={`Are you sure you want to delete "${deleteTarget?.title || 'this slide'}"? This action cannot be undone.`}
          confirmLabel="Delete"
          tone="danger"
          isLoading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />

        {/* Preview Info */}
        <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">📝 About Hero Slider</h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Slides are displayed in order from smallest to largest order number</li>
            <li>• Only active slides are shown on the homepage</li>
            <li>• Images are displayed on large screens (lg and up)</li>
            <li>• All changes are live immediately after saving</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function HeroContent() {
  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin']}>
      <HeroContentInner />
    </ProtectedRoute>
  )
}
