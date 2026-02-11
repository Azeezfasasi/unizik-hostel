'use client'

import React, { useState, useEffect } from 'react'
import { Loader, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  'in-use': 'bg-blue-100 text-blue-700',
  damage: 'bg-red-100 text-red-700',
  'under-repair': 'bg-yellow-100 text-yellow-700',
}

export default function AllFacilitiesPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      if (!isAuthenticated || !token) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/facility', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch facilities')
        const data = await res.json()
        setFacilities(data.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load facilities')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token) {
      fetchFacilities()
    }
  }, [isAuthenticated, token])

  const filteredFacilities = filter === 'all' ? facilities : facilities.filter(f => f.status === filter)

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">All Facilities</h1>
          <p className="text-gray-600 mt-1">Manage facilities and view damage reports</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'active', 'damage', 'under-repair', 'in-use', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Facilities Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading facilities...</p>
          </div>
        ) : filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map(facility => (
              <div key={facility._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{facility.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[facility.status]}`}>
                    {facility.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  {facility.category && (
                    <p><span className="font-medium">Category:</span> {facility.category.name || facility.category}</p>
                  )}
                  {facility.location && (
                    <p><span className="font-medium">Location:</span> {facility.location}</p>
                  )}
                </div>

                {facility.damageReports && facility.damageReports.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      Damage Reports ({facility.damageReports.length})
                    </p>
                    <div className="space-y-2">
                      {facility.damageReports.slice(0, 2).map((report, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">{new Date(report.reportedAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-700">{report.description.substring(0, 60)}...</p>
                          <p className="text-xs font-medium mt-1">
                            <span className="text-red-600">Status:</span> {report.repairStatus}
                          </p>
                        </div>
                      ))}
                      {facility.damageReports.length > 2 && (
                        <p className="text-xs text-gray-500">+{facility.damageReports.length - 2} more reports</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600 text-lg">No facilities found</p>
          </div>
        )}
      </div>
    </div>
  )
}
