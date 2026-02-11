'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CampusContext = createContext()

export const CampusProvider = ({ children }) => {
  const { token } = useAuth()
  const [campuses, setCampuses] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch campuses and hostels
  const fetchData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const [hostelsRes] = await Promise.all([
        fetch('/api/hostel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!hostelsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const hostelsData = await hostelsRes.json()

      if (!hostelsData.success) {
        throw new Error('Server returned an error')
      }

      // Set hostels
      setHostels(hostelsData.data || [])

      // Extract unique campuses from hostels
      const uniqueCampuses = [
        ...new Set((hostelsData.data || []).map((h) => h.hostelCampus).filter(Boolean)),
      ]
      setCampuses(uniqueCampuses)
    } catch (err) {
      console.error('Error fetching campus data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch data on token change
  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token, fetchData])

  // Get hostels for a specific campus
  const getHostelsByCampus = useCallback(
    (campusName) => {
      return hostels.filter((h) => h.hostelCampus === campusName)
    },
    [hostels]
  )

  return (
    <CampusContext.Provider
      value={{
        campuses,
        hostels,
        loading,
        error,
        fetchData,
        getHostelsByCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  )
}

export const useCampus = () => {
  const context = useContext(CampusContext)
  if (!context) {
    throw new Error('useCampus must be used within CampusProvider')
  }
  return context
}
