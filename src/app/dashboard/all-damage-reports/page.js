'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Filter, X, Edit, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AllDamageReportsPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [updateForm, setUpdateForm] = useState({ repairStatus: '', repairUpdate: '' })
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  
  const [filters, setFilters] = useState({
    status: '',
    facility: '',
    searchTerm: ''
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch all damage reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated || !token) return
      try {
        setLoading(true)
        const res = await fetch('/api/facility/damage-reports', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setReports(data.data || [])
          setFilteredReports(data.data || [])
        } else {
          setError('Failed to fetch damage reports')
        }
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchReports()
    }
  }, [isAuthenticated, token])

  // Apply filters
  useEffect(() => {
    let filtered = reports;

    if (filters.status) {
      filtered = filtered.filter(r => r.repairStatus === filters.status)
    }

    if (filters.facility) {
      filtered = filtered.filter(r => r.facilityId === filters.facility)
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.facilityName.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.student?.firstName.toLowerCase().includes(term) ||
        r.student?.lastName.toLowerCase().includes(term)
      )
    }

    setFilteredReports(filtered)
  }, [filters, reports])

  const handleUpdateClick = (report) => {
    setSelectedReport(report)
    setUpdateForm({ repairStatus: report.repairStatus, repairUpdate: report.repairUpdate })
    setShowUpdateModal(true)
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReport) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/facility/update-repair-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          facilityId: selectedReport.facilityId,
          reportId: selectedReport._id,
          repairStatus: updateForm.repairStatus,
          repairUpdate: updateForm.repairUpdate
        })
      })

      if (!res.ok) throw new Error('Failed to update repair status')

      // Update local state
      setReports(reports.map(r => 
        r._id === selectedReport._id 
          ? { ...r, repairStatus: updateForm.repairStatus, repairUpdate: updateForm.repairUpdate }
          : r
      ))

      setSuccess(true)
      setShowUpdateModal(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update repair status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'Completed':
        return 'bg-green-50 text-green-800 border-green-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getFacilityStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-800'
      case 'inactive':
        return 'bg-gray-50 text-gray-800'
      case 'in-use':
        return 'bg-blue-50 text-blue-800'
      case 'damage':
        return 'bg-red-50 text-red-800'
      case 'under-repair':
        return 'bg-yellow-50 text-yellow-800'
      default:
        return 'bg-gray-50 text-gray-800'
    }
  }

  // Get unique facilities for filter dropdown
  const uniqueFacilities = [...new Map(reports.map(r => [r.facilityId, r])).values()]

  // Statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.repairStatus === 'Pending').length,
    inProgress: reports.filter(r => r.repairStatus === 'In Progress').length,
    completed: reports.filter(r => r.repairStatus === 'Completed').length
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Damage Reports</h1>
          <p className="text-gray-600 mt-1">View and manage all facility damage reports</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search facility, student, or description..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repair Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select
                value={filters.facility}
                onChange={(e) => setFilters({...filters, facility: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Facilities</option>
                {uniqueFacilities.map(f => (
                  <option key={f.facilityId} value={f.facilityId}>{f.facilityName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700">Repair status updated successfully!</p>
          </div>
        )}

        {/* Reports Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading damage reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No damage reports found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reported</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.facilityName}</p>
                          <p className="text-xs text-gray-500">{report.category}</p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${getFacilityStatusColor(report.facilityStatus)}`}>
                            {report.facilityStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {report.student?.firstName} {report.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{report.student?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 line-clamp-2">{report.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.repairStatus)}`}>
                            {report.repairStatus}
                          </span>
                          {report.repairUpdate && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{report.repairUpdate}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleUpdateClick(report)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <Edit size={14} />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Repair Status</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Facility: <span className="font-medium text-gray-900">{selectedReport.facilityName}</span></p>
              <p className="text-sm text-gray-600 mt-1">Reported by: <span className="font-medium text-gray-900">{selectedReport.student?.firstName} {selectedReport.student?.lastName}</span></p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repair Status</label>
                <select
                  value={updateForm.repairStatus}
                  onChange={(e) => setUpdateForm({...updateForm, repairStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Note</label>
                <textarea
                  value={updateForm.repairUpdate}
                  onChange={(e) => setUpdateForm({...updateForm, repairUpdate: e.target.value})}
                  placeholder="Add any updates about the repair (e.g., 'Parts ordered', 'Repair in progress', 'Completed and tested')"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
