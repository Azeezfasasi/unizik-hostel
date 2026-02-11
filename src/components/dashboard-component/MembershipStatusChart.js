'use client'
import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { CheckCircle, Clock, XCircle, BarChart3 } from 'lucide-react'

const COLORS = {
  approved: '#10b981',
  pending: '#f59e0b',
  'under-review': '#3b82f6',
  rejected: '#ef4444'
}

const STATUS_ICONS = {
  approved: <CheckCircle className="w-5 h-5" />,
  pending: <Clock className="w-5 h-5" />,
  'under-review': <BarChart3 className="w-5 h-5" />,
  rejected: <XCircle className="w-5 h-5" />
}

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending',
  'under-review': 'Under Review',
  rejected: 'Rejected'
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">Count: <span className="font-bold text-gray-900">{data.value}</span></p>
        <p className="text-sm text-gray-600">Percentage: <span className="font-bold text-gray-900">{data.percentage.toFixed(1)}%</span></p>
      </div>
    )
  }
  return null
}

function CustomLegend(props) {
  const { payload } = props
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-xs sm:text-sm text-gray-700 font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function MembershipStatusChart() {
  const { token } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({})
  const [containerWidth, setContainerWidth] = useState(null)

  useEffect(() => {
    const fetchMembershipStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/joinus/stats/overview', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()
        console.log('Membership stats response:', result) // Debug log

        if (result.success && result.data) {
          const { byStatus, totalApplications } = result.data
          
          // Transform data for pie chart - include all statuses even if 0
          // Note: API uses camelCase (underReview) not hyphenated (under-review)
          const chartData = [
            {
              name: STATUS_LABELS.approved,
              value: byStatus.approved || 0,
              status: 'approved',
              percentage: totalApplications > 0 ? ((byStatus.approved || 0) / totalApplications) * 100 : 0
            },
            {
              name: STATUS_LABELS['under-review'],
              value: byStatus.underReview || 0,  // API uses camelCase: underReview
              status: 'under-review',
              percentage: totalApplications > 0 ? ((byStatus.underReview || 0) / totalApplications) * 100 : 0
            },
            {
              name: STATUS_LABELS.pending,
              value: byStatus.pending || 0,
              status: 'pending',
              percentage: totalApplications > 0 ? ((byStatus.pending || 0) / totalApplications) * 100 : 0
            },
            {
              name: STATUS_LABELS.rejected,
              value: byStatus.rejected || 0,
              status: 'rejected',
              percentage: totalApplications > 0 ? ((byStatus.rejected || 0) / totalApplications) * 100 : 0
            }
          ]

          console.log('Chart data:', chartData) // Debug log
          // Keep all statuses, only filter out if we have NO data at all
          const filteredData = totalApplications > 0 ? chartData : []
          setData(filteredData)
          setStats(byStatus)
        } else {
          setError('Invalid response format')
        }
      } catch (err) {
        console.error('Failed to fetch membership stats:', err)
        setError(`Failed to load membership status data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchMembershipStats()
      const interval = setInterval(fetchMembershipStats, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
      setError('No authentication token available')
    }
  }, [token])

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          Membership Status Overview
        </h2>
        {error && (
          <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
            {error}. Showing sample data.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Loading membership data...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 sm:h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No membership data available</p>
        </div>
      ) : (
        <>
          {/* Chart Container */}
          <div className="mb-6 sm:mb-8">
            <div className="w-full h-64 sm:h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.length > 0 ? data : [{ name: 'No Data', value: 1, status: 'none', percentage: 100 }]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(0)}%`}
                    outerRadius={window.innerWidth < 640 ? 70 : 100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(data.length > 0 ? data : [{ name: 'No Data', value: 1, status: 'none', percentage: 100 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#d1d5db'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  {data.length > 0 && <Legend content={<CustomLegend />} />}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics Cards */}
          {data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {data.map((item) => (
                <div
                  key={item.status}
                  className="bg-gradient-to-br from-green-50 to-green-50 rounded-lg p-3 sm:p-4 border-l-4"
                  style={{ borderColor: COLORS[item.status] }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div style={{ color: COLORS[item.status] }}>
                      {STATUS_ICONS[item.status]}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{item.name}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Summary Stats */}
          {data.length > 0 && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                    {data.reduce((sum, item) => sum + item.value, 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">Approval Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">
                    {data.length > 0 && data.reduce((sum, item) => sum + item.value, 0) > 0
                      ? ((data.find(d => d.status === 'approved')?.value || 0) / data.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
