'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { AlertCircle, Loader } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function CampusChart() {
  const { token, user } = useAuth()
  const [campusData, setCampusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState('bar') // 'bar' or 'pie'

  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch hostels to group by campus
        const response = await axios.get('/api/hostel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success && response.data.data) {
          // Group hostels by campus and calculate stats
          const campusMap = {}
          
          response.data.data.forEach((hostel) => {
            const campus = hostel.hostelCampus || 'Unknown'
            if (!campusMap[campus]) {
              campusMap[campus] = {
                name: campus,
                hostels: 0,
                totalCapacity: 0,
              }
            }
            campusMap[campus].hostels += 1
            campusMap[campus].totalCapacity += 1 // Placeholder for actual capacity
          })

          const chartData = Object.values(campusMap).sort((a, b) => b.hostels - a.hostels)
          setCampusData(chartData)
        }
      } catch (err) {
        console.error('Failed to fetch campus data:', err)
        setError('Failed to load campus data')
      } finally {
        setLoading(false)
      }
    }

    if (token && user && (user.role === 'admin' || user.role === 'super admin')) {
      fetchCampusData()
    }
  }, [token, user])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600 text-sm">Loading campus data...</p>
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

  if (campusData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No campus data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Campus Overview</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Hostel distribution across campuses</p>
        </div>
        <div className="flex gap-2">
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
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="w-full overflow-x-auto">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={campusData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
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
              />
              <Legend />
              <Bar dataKey="hostels" fill="#3b82f6" name="Hostels" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, hostels }) => `${name}: ${hostels}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="hostels"
              >
                {campusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <p className="text-xs text-gray-600 font-medium">Total Campuses</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{
            new Set(campusData.map(c => c.name)).size
          }</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs text-gray-600 font-medium">Total Hostels</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{
            campusData.reduce((sum, c) => sum + c.hostels, 0)
          }</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
          <p className="text-xs text-gray-600 font-medium">Avg Hostels/Campus</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{
            (campusData.reduce((sum, c) => sum + c.hostels, 0) / campusData.length).toFixed(1)
          }</p>
        </div>
      </div>
    </div>
  )
}
