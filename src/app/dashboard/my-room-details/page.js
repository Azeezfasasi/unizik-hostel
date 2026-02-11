'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  MapPin,
  Users,
  Bed,
  Phone,
  Mail,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  Home,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function MyRoomDetailsPage() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const cardRef = useRef(null)
  const [roomData, setRoomData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch user's room data
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!isAuthenticated || !token || !user) return

      try {
        setLoading(true)
        setError(null)

        // First, try to fetch approved room requests for the user
        let userRoom = null
        let roomRequest = null

        try {
          const requestsRes = await fetch('/api/room/my-requests', {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (requestsRes.ok) {
            const requestsData = await requestsRes.json()
            const approvedRequest = requestsData.requests?.find(
              (req) => req.status === 'approved'
            )

            if (approvedRequest && approvedRequest.room) {
              roomRequest = approvedRequest
              userRoom = approvedRequest.room
            }
          }
        } catch (err) {
          console.warn('Could not fetch room requests:', err)
        }

        // If no approved request, check if student is in assignedStudents
        if (!userRoom) {
          const roomsRes = await fetch('/api/room', {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!roomsRes.ok) {
            throw new Error('Failed to fetch room data')
          }

          const roomsData = await roomsRes.json()
          const rooms = roomsData.data || []

          userRoom = rooms.find((room) =>
            room.assignedStudents?.some((student) => student._id === user.id)
          )
        }

        if (!userRoom) {
          setError('No room assigned yet')
          return
        }

        // Get hostel info
        const hostelId = userRoom.hostelId?._id || userRoom.hostelId
        const hostelsRes = await fetch('/api/hostel', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (hostelsRes.ok) {
          const hostelsData = await hostelsRes.json()
          const hostel = hostelsData.data?.find((h) => h._id === hostelId)

          setRoomData({
            room: userRoom,
            hostel: hostel || {},
            roomRequest: roomRequest,
          })
        } else {
          setRoomData({
            room: userRoom,
            hostel: {},
            roomRequest: roomRequest,
          })
        }
      } catch (err) {
        console.error('Error fetching room data:', err)
        setError(err.message || 'Failed to load room details')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && token && user) {
      fetchRoomData()
    }
  }, [isAuthenticated, token, user])

  // Download card as image
  const handleDownload = async () => {
    try {
      setDownloading(true)

      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default

      if (!cardRef.current) {
        throw new Error('Card reference not found')
      }

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        allowTaint: true,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `room-details-${roomData?.room?.roomNumber || 'card'}.png`
      link.click()

      alert('Room details card downloaded successfully!')
    } catch (err) {
      console.error('Error downloading card:', err)
      alert('Failed to download card. Try printing instead (Print to PDF).')
    } finally {
      setDownloading(false)
    }
  }

  // Print card
  const handlePrint = () => {
    if (!cardRef.current) return
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write('<html><head><title>Room Details Card</title>')
    printWindow.document.write('<style>')
    printWindow.document.write('body { font-family: Arial, sans-serif; }')
    printWindow.document.write('</style></head><body>')
    printWindow.document.write(cardRef.current.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.print()
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

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading your room details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Room Details</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Room Assignment Required</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                Please contact the hostel office to request a room assignment.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!roomData) {
    return null
  }

  const { room, hostel } = roomData
  const roommates = room.assignedStudents?.filter((s) => s._id !== user?.id) || []
  const occupancy = room.assignedStudents?.length || 0
  const availability = (room.capacity || 4) - occupancy

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Room Details</h1>
              <p className="text-gray-600 mt-1">Your hostel room assignment</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Download size={18} />
                {downloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Card */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 sm:px-8 py-8 sm:py-12">
            {/* Student Profile Image */}
            {user?.profileImage && (
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-32 h-32 rounded-md object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  Room {room.roomNumber}
                </h2>
                <p className="text-blue-100 text-lg">{hostel.name}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle className="text-white mb-1" size={24} />
                <p className="text-white text-xs font-semibold uppercase">
                  {roomData?.roomRequest?.status === 'approved' ? 'Approved' : 'Assigned'}
                </p>
              </div>
            </div>

            {/* Location Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-blue-100 text-xs uppercase font-medium">Block</p>
                <p className="text-white text-2xl font-bold">{hostel.block || 'N/A'}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-blue-100 text-xs uppercase font-medium">Floor</p>
                <p className="text-white text-2xl font-bold">{room.roomFloor || 'N/A'}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <p className="text-blue-100 text-xs uppercase font-medium">Capacity</p>
                <p className="text-white text-2xl font-bold">{room.capacity || 4}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-8 sm:py-12 space-y-8">
            {/* Campus & Hostel Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Campus</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {hostel.hostelCampus || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Home className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {hostel.location || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Information */}
            {roomData?.roomRequest && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-900">Room Request Approved</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-700 uppercase font-medium">Approval Date</p>
                    <p className="text-lg font-semibold text-green-900">
                      {roomData.roomRequest.createdAt
                        ? new Date(roomData.roomRequest.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 uppercase font-medium">Status</p>
                    <p className="text-lg font-semibold text-green-600">✓ Approved</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Occupancy Status
                </h3>
                <span className="text-2xl font-bold text-blue-600">
                  {occupancy}/{room.capacity || 4}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                  style={{ width: `${(occupancy / (room.capacity || 4)) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">Occupied</p>
                  <p className="text-2xl font-bold text-green-600">{occupancy}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">Available</p>
                  <p className="text-2xl font-bold text-gray-600">{availability}</p>
                </div>
              </div>
            </div>

            {/* Your Info */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Your Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Matric Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.matricNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Roommates */}
            {roommates.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Your Roommates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roommates.map((roommate) => (
                    <div key={roommate._id} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-500 font-medium mb-1">Name</p>
                      <p className="text-lg font-semibold text-gray-900 mb-3">
                        {roommate.firstName} {roommate.lastName}
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Matric:</span> {roommate.matricNumber || 'N/A'}
                        </p>
                        {roommate.phone && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <Phone size={14} />
                            {roommate.phone}
                          </p>
                        )}
                        {roommate.email && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <Mail size={14} />
                            {roommate.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {hostel.facilities && hostel.facilities.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed size={20} className="text-blue-600" />
                  Facilities & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hostel.facilities.map((facility, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      ✓ {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {hostel.rulesAndPolicies && (
              <div className="border-t pt-8 bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hostel Rules & Policies</h3>
                <p className="text-gray-700 leading-relaxed">{hostel.rulesAndPolicies}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 sm:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Hostel Assignment Card • Generated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            If you have questions about your room assignment or need to report maintenance issues, please
            contact the hostel office.
          </p>
        </div>
      </div>
    </div>
  )
}
