'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Send, ClipboardList } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import { notify } from '@/components/dashboard-component/ui/toast'

export default function ReportDamagesPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState([])
  const [formData, setFormData] = useState({
    facility: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch facilities (also used to derive the current user's own past reports)
  const fetchFacilities = async () => {
    if (!isAuthenticated || !token) return
    try {
      setFetchLoading(true)
      const res = await fetch('/api/facility', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFacilities(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching facilities:', err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFacilities()
    }
  }, [isAuthenticated, token])

  // Flatten the current user's own damage reports across all facilities so
  // they can see the status of issues they previously submitted.
  const myReports = useMemo(() => {
    if (!user) return []
    const userId = String(user._id || user.id || '')
    const mine = []
    facilities.forEach(facility => {
      (facility.damageReports || []).forEach(report => {
        const reportStudentId = String(
          typeof report.student === 'object' && report.student !== null
            ? report.student._id
            : report.student
        )
        if (reportStudentId === userId) {
          mine.push({
            ...report,
            facilityName: facility.name,
          })
        }
      })
    })
    return mine.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
  }, [facilities, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.facility.trim() || !formData.description.trim()) {
      notify.error('All fields are required')
      return
    }

    if (formData.description.length < 10) {
      notify.error('Description must be at least 10 characters')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/facility/report-damage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit report')

      notify.success('Damage report submitted successfully')
      setFormData({ facility: '', description: '' })
      fetchFacilities()
    } catch (err) {
      notify.error(err.message || 'Failed to submit report')
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
        icon={Send}
        title="Report Damage"
        subtitle="Report any damage to facilities"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            Please provide detailed information about any damage you notice to hostel facilities. This helps us maintain a safe and comfortable living environment for all students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facility *</label>
            <select
              name="facility"
              value={formData.facility}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="">Select a facility</option>
              {facilities.map(facility => (
                <option key={facility._id} value={facility._id}>{facility.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description of Damage *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe the damage in detail. Include what is damaged, when you noticed it, and how it affects the facility..."
              rows={6}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length} / 1000 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading || fetchLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
          >
            <Send size={18} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      {/* My Reported Issues */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList className="w-4.5 h-4.5 text-blue-900" size={18} />
          <h2 className="text-base font-semibold text-gray-900">My Reported Issues</h2>
        </div>

        {fetchLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading your reports...</div>
        ) : myReports.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No reports yet" message="Issues you report will show up here so you can track their status." />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myReports.map((report, idx) => (
              <div key={report._id || idx} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{report.facilityName}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{report.description}</p>
                  {report.repairUpdate && (
                    <p className="text-xs text-gray-500 mt-1">Update: {report.repairUpdate}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Reported {new Date(report.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={report.repairStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
