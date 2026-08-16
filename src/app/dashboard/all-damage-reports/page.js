'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Filter, X, Pencil, ClipboardList } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import Pagination from '@/components/dashboard-component/ui/Pagination'
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge'
import { notify } from '@/components/dashboard-component/ui/toast'

const PAGE_SIZE = 10

export default function AllDamageReportsPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [updateForm, setUpdateForm] = useState({ repairStatus: '', repairUpdate: '' })
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [page, setPage] = useState(1)

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
          notify.error('Failed to fetch damage reports')
        }
      } catch (err) {
        console.error('Error fetching reports:', err)
        notify.error(err.message || 'Failed to fetch damage reports')
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
    setPage(1)
  }, [filters, reports])

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE))
  const paginatedReports = filteredReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleUpdateClick = (report) => {
    setSelectedReport(report)
    setUpdateForm({ repairStatus: report.repairStatus, repairUpdate: report.repairUpdate })
    setShowUpdateModal(true)
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReport) return

    try {
      setUpdateLoading(true)

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

      notify.success('Repair status updated successfully')
      setShowUpdateModal(false)
    } catch (err) {
      notify.error(err.message || 'Failed to update repair status')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Get unique facilities for filter dropdown
  const uniqueFacilities = useMemo(() => [...new Map(reports.map(r => [r.facilityId, r])).values()], [reports])

  // Statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.repairStatus === 'Pending').length,
    inProgress: reports.filter(r => r.repairStatus === 'In Progress').length,
    completed: reports.filter(r => r.repairStatus === 'Completed').length
  }

  if (authLoading) {
    return <PageSpinner label="Loading..." />
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={ClipboardList}
        title="Damage Reports"
        subtitle="View and manage all facility damage reports"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-gray-500 text-sm font-medium">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-amber-500">
          <p className="text-gray-500 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
            <input
              type="text"
              placeholder="Search facility, student, or description..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Repair Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Facility</label>
            <select
              value={filters.facility}
              onChange={(e) => setFilters({...filters, facility: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="">All Facilities</option>
              {uniqueFacilities.map(f => (
                <option key={f.facilityId} value={f.facilityId}>{f.facilityName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <PageSpinner label="Loading damage reports..." />
      ) : filteredReports.length === 0 ? (
        <EmptyState title="No damage reports found" message="Try adjusting your filters." />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Facility</th>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Reported</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.facilityName}</p>
                          <p className="text-xs text-gray-500">{report.category}</p>
                          <div className="mt-1">
                            <StatusBadge status={report.facilityStatus} />
                          </div>
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
                        <p className="text-sm text-gray-900 line-clamp-2 max-w-xs">{report.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <StatusBadge status={report.repairStatus} />
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredReports.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Update Repair Status</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-5 mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Facility: <span className="font-medium text-gray-900">{selectedReport.facilityName}</span></p>
              <p className="text-sm text-gray-600 mt-1">Reported by: <span className="font-medium text-gray-900">{selectedReport.student?.firstName} {selectedReport.student?.lastName}</span></p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Repair Status</label>
                <select
                  value={updateForm.repairStatus}
                  onChange={(e) => setUpdateForm({...updateForm, repairStatus: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Update Note</label>
                <textarea
                  value={updateForm.repairUpdate}
                  onChange={(e) => setUpdateForm({...updateForm, repairUpdate: e.target.value})}
                  placeholder="Add any updates about the repair (e.g., 'Parts ordered', 'Repair in progress', 'Completed and tested')"
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
