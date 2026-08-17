'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff, ArrowUpDown, Upload, LayoutGrid } from 'lucide-react'
import Image from 'next/image'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { notify } from '@/components/dashboard-component/ui/toast'
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { TableSkeleton } from '@/components/dashboard-component/ui/Skeleton'

function WelcomeCTAInner() {
  const { token } = useAuth()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description1: '',
    description2: '',
    image: { src: '', alt: '' },
    button: { label: '', href: '' },
    order: 0,
    isActive: true
  })
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch sections on mount
  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/welcome?includeInactive=true')
      const result = await res.json()
      if (result.success) {
        setSections(result.data)
      }
    } catch (err) {
      setError('Failed to fetch welcome sections')
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
      formDataForUpload.append('folder', 'cananusa/welcome-sections')

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    if (!formData.title || !formData.description1 || !formData.button.label || !formData.button.href) {
      notify.error('Please fill in all required fields')
      return
    }

    try {
      const url = editingId ? `/api/welcome/${editingId}` : '/api/welcome'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (result.success) {
        notify.success(editingId ? 'Section updated successfully' : 'Section created successfully')
        fetchSections()
        resetForm()
        setShowForm(false)
      } else {
        notify.error(result.error || 'Operation failed')
      }
    } catch (err) {
      notify.error('Failed to save section')
      console.error(err)
    }
  }

  const handleEdit = (section) => {
    setFormData(section)
    setEditingId(section._id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDeleteClick = (section) => {
    setDeleteTarget(section)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/welcome/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()

      if (result.success) {
        notify.success('Section deleted successfully')
        fetchSections()
        setDeleteTarget(null)
      } else {
        notify.error(result.error || 'Failed to delete section')
      }
    } catch (err) {
      notify.error('Failed to delete section')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (section) => {
    try {
      const res = await fetch(`/api/welcome/${section._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !section.isActive })
      })

      const result = await res.json()
      if (result.success) {
        fetchSections()
      }
    } catch (err) {
      notify.error('Failed to toggle section visibility')
      console.error(err)
    }
  }

  const handleReorder = async (id, newOrder) => {
    try {
      const res = await fetch(`/api/welcome/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: newOrder })
      })

      const result = await res.json()
      if (result.success) {
        fetchSections()
      }
    } catch (err) {
      notify.error('Failed to reorder section')
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description1: '',
      description2: '',
      image: { src: '', alt: '' },
      button: { label: '', href: '' },
      order: 0,
      isActive: true
    })
    setEditingId(null)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={LayoutGrid}
          title="Welcome/About Section Management"
          subtitle="Manage the welcome/about sections shown on the homepage"
          actions={
            <button
              onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus size={18} /> {showForm ? 'Cancel' : 'Add Section'}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editingId ? 'Edit Section' : 'Create New Section'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., About Unizik Hostel"
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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

              {/* Description 1 */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  First Paragraph *
                </label>
                <textarea
                  name="description1"
                  value={formData.description1}
                  onChange={handleFormChange}
                  placeholder="First paragraph of your content"
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              {/* Description 2 */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Second Paragraph (Optional)
                </label>
                <textarea
                  name="description2"
                  value={formData.description2}
                  onChange={handleFormChange}
                  placeholder="Second paragraph of your content (optional)"
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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

              {/* Image Alt Text */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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

              {/* Image Preview */}
              {formData.image.src && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                  <img
                    src={formData.image.src}
                    alt={formData.image.alt || 'Preview'}
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png'
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Button Label */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Button Label *
                  </label>
                  <input
                    type="text"
                    name="button.label"
                    value={formData.button.label}
                    onChange={handleFormChange}
                    placeholder="e.g., Learn More"
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>

                {/* Button Link */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Button Link *
                  </label>
                  <input
                    type="text"
                    name="button.href"
                    // readOnly
                    value={formData.button.href}
                    onChange={handleFormChange}
                    placeholder="e.g., /about-us"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  />
                </div>
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
                <label htmlFor="isActive" className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                  Active (Show on homepage)
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false) }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                >
                  {editingId ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sections List */}
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : sections.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No sections yet"
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
                  <th className="px-4 sm:px-6 py-3 text-left">Button</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {
                  sections.map((section) => (
                    <tr key={section._id} className="hover:bg-gray-50/60">
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReorder(section._id, Math.max(0, section.order - 1))}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Move up"
                          >
                            <ArrowUpDown size={14} className="rotate-180" />
                          </button>
                          <span className="px-2">{section.order}</span>
                          <button
                            onClick={() => handleReorder(section._id, section.order + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Move down"
                          >
                            <ArrowUpDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 max-w-xs truncate">
                        {section.title}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        {section.button.label}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm">
                        <button
                          onClick={() => handleToggleActive(section)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            section.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {section.isActive ? (
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
                          onClick={() => handleEdit(section)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(section)}
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
              sections.map((section) => (
                <div key={section._id} className="p-4 hover:bg-gray-50/60">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{section.title}</p>
                      <p className="text-xs text-gray-600 mt-1">Button: {section.button.label}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(section)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                        section.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {section.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <p className="text-gray-600">Order</p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleReorder(section._id, Math.max(0, section.order - 1))}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Move up"
                        >
                          <ArrowUpDown size={12} className="rotate-180" />
                        </button>
                        <span className="font-medium">{section.order}</span>
                        <button
                          onClick={() => handleReorder(section._id, section.order + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Move down"
                        >
                          <ArrowUpDown size={12} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium mt-1">{section.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="flex-1 px-2 py-2 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(section)}
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
          title="Delete section?"
          message={`Are you sure you want to delete "${deleteTarget?.title || 'this section'}"? This action cannot be undone.`}
          confirmLabel="Delete"
          tone="danger"
          isLoading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />

        {/* Info */}
        <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">📝 About Welcome/About Sections</h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Sections are displayed in order from smallest to largest order number</li>
            <li>• Only active sections are shown on the homepage</li>
            <li>• You can add multiple sections for different about content</li>
            <li>• All changes are live immediately after saving</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function WelcomeCTA() {
  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin']}>
      <WelcomeCTAInner />
    </ProtectedRoute>
  )
}
