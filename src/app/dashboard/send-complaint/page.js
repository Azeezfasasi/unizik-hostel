'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Send, MessageSquareWarning } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import { notify } from '@/components/dashboard-component/ui/toast'

const initialForm = {
  category: '',
  description: '',
  location: '',
  phone: '',
  priority: 'Medium'
}

export default function SendComplaints() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(initialForm)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.category || !formData.description || !formData.location) {
      notify.error('Please fill in all required fields')
      return
    }

    if (formData.description.length < 10) {
      notify.error('Description must be at least 10 characters')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: user._id,
          studentName: `${user.firstName} ${user.lastName}`,
          studentEmail: user.email,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          phone: formData.phone || user.phone || '',
          priority: formData.priority
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint')

      notify.success('Complaint submitted successfully')
      setSuccess(true)
      setFormData(initialForm)
    } catch (err) {
      notify.error(err.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={MessageSquareWarning}
        title="Submit a Complaint"
        subtitle="Report an issue or problem in your hostel"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {success ? (
          <div className="flex flex-col items-center text-center py-10">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Complaint submitted successfully</h2>
            <p className="mt-1.5 text-sm text-gray-500 max-w-sm">
              We have received your complaint and will look into it shortly. You can track its status from the manage complaints page if you have access, or contact hostel management.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
              >
                Submit another complaint
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Please provide detailed information about your complaint. Include the location and a clear description of the issue so we can resolve it quickly.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Info (Display Only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Security">Security</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Noise">Noise</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Room/Area) *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 201, Hostel A"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please provide a detailed description of the issue..."
                  required
                  rows="6"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 xxx xxxx xxxx"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  <Send size={18} className={loading ? 'animate-pulse' : ''} />
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
