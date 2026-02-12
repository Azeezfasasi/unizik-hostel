'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ManageMessageSlider() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    text: '',
    backgroundColor: '#1e40af',
    textColor: '#ffffff',
    speed: 'normal',
    displayOrder: 0
  })

  // Fetch messages
  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/message?includeInactive=true')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) || 0 : value
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      text: '',
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      speed: 'normal',
      displayOrder: 0
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  // Add new message
  const handleAddMessage = async (e) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      setError('Message text is required')
      return
    }

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...formData,
          text: formData.text.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Message added successfully!')
        setMessages(prev => [data.data, ...prev])
        resetForm()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to add message')
      }
    } catch (err) {
      console.error('Error adding message:', err)
      setError('Failed to add message')
    }
  }

  // Update message
  const handleUpdateMessage = async (messageId, e) => {
    e.preventDefault()
    
    const message = messages.find(m => m._id === messageId)
    if (!message) return

    if (!message.text.trim()) {
      setError('Message text is required')
      return
    }

    try {
      const response = await fetch(`/api/message/${messageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(message)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Message updated successfully!')
        setMessages(prev => prev.map(m => m._id === messageId ? data.data : m))
        setEditingId(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update message')
      }
    } catch (err) {
      console.error('Error updating message:', err)
      setError('Failed to update message')
    }
  }

  // Toggle message active status
  const handleToggleActive = async (messageId) => {
    const message = messages.find(m => m._id === messageId)
    if (!message) return

    try {
      const response = await fetch(`/api/message/${messageId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ ...message, isActive: !message.isActive })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => prev.map(m => m._id === messageId ? data.data : m))
      } else {
        setError(data.error || 'Failed to toggle message status')
      }
    } catch (err) {
      console.error('Error toggling message:', err)
      setError('Failed to toggle message status')
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/message/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Message deleted successfully!')
        setMessages(prev => prev.filter(m => m._id !== messageId))
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to delete message')
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      setError('Failed to delete message')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            📢 Message Slider Manager
          </h1>
          <p className="text-slate-600">Create and manage dynamic scrolling messages for UNIZIK Hostel</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-start gap-3 rounded">
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="font-semibold">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Add Message Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Plus size={24} className="text-blue-500" />
              Add New Message
            </h2>

            <form onSubmit={handleAddMessage} className="space-y-6">
              {/* Message Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message Text *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Enter your message here (max 500 characters)..."
                  maxLength={500}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">{formData.text.length}/500 characters</p>
              </div>

              {/* Color & Speed Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Background Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="h-12 w-20 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      name="backgroundColor"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="h-12 w-20 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      name="textColor"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Animation Speed */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Animation Speed
                  </label>
                  <select
                    name="speed"
                    value={formData.speed}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="slow">Slow (30s)</option>
                    <option value="normal">Normal (20s)</option>
                    <option value="fast">Fast (12s)</option>
                  </select>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Order (Lower = Earlier)
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: formData.backgroundColor }}>
                <p style={{ color: formData.textColor }} className="font-semibold text-center">
                  Preview: {formData.text || 'Your message will appear here...'}
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                >
                  <X size={18} className="inline mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  <Save size={18} className="inline mr-2" />
                  Add Message
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Message Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-md"
          >
            <Plus size={20} />
            Add New Message
          </button>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-slate-600 mt-4">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
              <p className="text-slate-600 text-lg">No messages yet. Create your first message above!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Message Preview */}
                <div
                  className="p-4"
                  style={{ backgroundColor: message.backgroundColor }}
                >
                  <p style={{ color: message.textColor }} className="font-semibold">
                    {message.text}
                  </p>
                </div>

                {/* Message Details & Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Speed</p>
                      <p className="font-semibold text-slate-900 capitalize">{message.speed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Order</p>
                      <p className="font-semibold text-slate-900">{message.displayOrder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                      <p className={`font-semibold ${message.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {message.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Created</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleActive(message._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        message.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {message.isActive ? (
                        <>
                          <EyeOff size={16} />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Show
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setEditingId(editingId === message._id ? null : message._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold transition-colors"
                    >
                      <Edit2 size={16} />
                      {editingId === message._id ? 'Done' : 'Edit'}
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>

                  {/* Edit Form */}
                  {editingId === message._id && (
                    <form onSubmit={(e) => handleUpdateMessage(message._id, e)} className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-bold text-slate-900 mb-4">Edit Message</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Message Text</label>
                          <textarea
                            value={message.text}
                            onChange={(e) => setMessages(prev => prev.map(m => 
                              m._id === message._id ? { ...m, text: e.target.value } : m
                            ))}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="2"
                          />
                          <p className="text-xs text-slate-500 mt-1">{message.text.length}/500</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">BG Color</label>
                            <input
                              type="color"
                              value={message.backgroundColor}
                              onChange={(e) => setMessages(prev => prev.map(m => 
                                m._id === message._id ? { ...m, backgroundColor: e.target.value } : m
                              ))}
                              className="w-full h-10 border border-slate-300 rounded cursor-pointer"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Text Color</label>
                            <input
                              type="color"
                              value={message.textColor}
                              onChange={(e) => setMessages(prev => prev.map(m => 
                                m._id === message._id ? { ...m, textColor: e.target.value } : m
                              ))}
                              className="w-full h-10 border border-slate-300 rounded cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Speed</label>
                            <select
                              value={message.speed}
                              onChange={(e) => setMessages(prev => prev.map(m => 
                                m._id === message._id ? { ...m, speed: e.target.value } : m
                              ))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            >
                              <option value="slow">Slow</option>
                              <option value="normal">Normal</option>
                              <option value="fast">Fast</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                          >
                            <Save size={16} className="inline mr-2" />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
