'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { AlertCircle, Loader } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function HostelChart() {
  const { token, user } = useAuth()
  const [hostelData, setHostelData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState('bar') // 'bar', 'line', or 'area'

  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch hostels and rooms data
        const [hostelRes, roomRes] = await Promise.all([
          axios.get('/api/hostel', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/room', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (hostelRes.data.success && hostelRes.data.data) {
          // Group rooms by hostel
          const hostelMap = {}

          hostelRes.data.data.forEach((hostel) => {
            hostelMap[hostel._id] = {
              name: hostel.name.substring(0, 20) + (hostel.name.length > 20 ? '...' : ''),
              fullName: hostel.name,
              totalRooms: 0,
              occupiedRooms: 0,
              totalCapacity: 0,
              occupiedCapacity: 0,
            }
          })

          // Count rooms and occupancy
          if (roomRes.data.success && roomRes.data.data) {
            roomRes.data.data.forEach((room) => {
              const hostelId = room.hostelId?._id || room.hostelId
              if (hostelMap[hostelId]) {
                hostelMap[hostelId].totalRooms += 1
                hostelMap[hostelId].totalCapacity += room.capacity || 0
                const occupied = room.currentOccupancy || room.assignedStudents?.length || 0
                if (occupied > 0) {
                  hostelMap[hostelId].occupiedRooms += 1
                  hostelMap[hostelId].occupiedCapacity += occupied
                }
              }
            })
          }

          // Convert to array and sort by occupied capacity (desc)
          const chartData = Object.values(hostelMap)
            .filter(h => h.totalRooms > 0)
            .sort((a, b) => b.occupiedCapacity - a.occupiedCapacity)
            .slice(0, 8) // Limit to top 8 for readability

          setHostelData(chartData)
        }
      } catch (err) {
        console.error('Failed to fetch hostel data:', err)
        setError('Failed to load hostel data')
      } finally {
        setLoading(false)
      }
    }

    if (token && user && (user.role === 'admin' || user.role === 'super admin')) {
      fetchHostelData()
    }
  }, [token, user])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600 text-sm">Loading hostel data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (hostelData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No hostel data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Hostel Occupancy Analytics</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Top {hostelData.length} hostels by occupancy</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'area'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Area
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="w-full overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={320} minWidth={300}>
            <BarChart data={hostelData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                formatter={(value) => value.toString()}
                labelFormatter={(label) => `Hostel: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="occupiedCapacity"
                fill="#ef4444"
                name="Occupied Beds"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="totalCapacity"
                fill="#10b981"
                name="Total Beds"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={320} minWidth={300}>
            <LineChart data={hostelData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="occupiedCapacity"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
                name="Occupied Beds"
              />
              <Line
                type="monotone"
                dataKey="totalCapacity"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Beds"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320} minWidth={300}>
            <AreaChart data={hostelData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <defs>
                <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="occupiedCapacity"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorOccupied)"
                name="Occupied Beds"
              />
              <Area
                type="monotone"
                dataKey="totalCapacity"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Beds"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <p className="text-xs text-gray-600 font-medium">Total Occupied</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{
            hostelData.reduce((sum, h) => sum + h.occupiedCapacity, 0)
          }</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs text-gray-600 font-medium">Total Capacity</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{
            hostelData.reduce((sum, h) => sum + h.totalCapacity, 0)
          }</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
          <p className="text-xs text-gray-600 font-medium">Occupancy Rate</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{
            (
              (hostelData.reduce((sum, h) => sum + h.occupiedCapacity, 0) /
                hostelData.reduce((sum, h) => sum + h.totalCapacity, 0)) *
              100
            ).toFixed(1)
          }%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
          <p className="text-xs text-gray-600 font-medium">Hostels Tracked</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{hostelData.length}</p>
        </div>
      </div>
    </div>
  )
}
