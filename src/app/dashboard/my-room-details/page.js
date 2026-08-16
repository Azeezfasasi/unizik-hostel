'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Users,
  Bed,
  Phone,
  Mail,
  Download,
  Printer,
  AlertCircle,
  CheckCircle,
  Loader2,
  Home,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import EmptyState from '@/components/dashboard-component/ui/EmptyState'
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton'
import { notify } from '@/components/dashboard-component/ui/toast'
import Image from 'next/image'

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

      notify.success('Room details card downloaded successfully!')
    } catch (err) {
      console.error('Error downloading card:', err)
      notify.error('Failed to download card. Try printing instead (Print to PDF).')
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

  if (authLoading || loading) {
    return <PageSpinner label={authLoading ? 'Loading...' : 'Loading your room details...'} />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader icon={Home} title="My Room Details" subtitle="Your hostel room assignment" />
        <EmptyState
          icon={AlertCircle}
          title="Room Assignment Required"
          message={`${error}. Please contact the hostel office to request a room assignment.`}
        />
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
    <div className="max-w-4xl mx-auto space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Home}
        title="My Room Details"
        subtitle="Your hostel room assignment"
        actions={
          <>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </>
        }
      />

      {/* Room Card */}
      <div ref={cardRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 sm:px-8 py-8 sm:py-12">
          {/* Student Profile Image */}
          {user?.profileImage && (
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Image
                  width={128}
                  height={128}
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
                <div className="bg-blue-900/10 p-3 rounded-lg">
                  <MapPin className="text-blue-900" size={20} />
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
                <div className="bg-blue-900/10 p-3 rounded-lg">
                  <Home className="text-blue-900" size={20} />
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
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-emerald-600" size={20} />
                <h3 className="font-semibold text-emerald-900">Room Request Approved</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-emerald-700 uppercase font-medium">Approval Date</p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {roomData.roomRequest.createdAt
                      ? new Date(roomData.roomRequest.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 uppercase font-medium">Status</p>
                  <p className="text-lg font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle size={16} />
                    Approved
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-blue-900" />
                Occupancy Status
              </h3>
              <span className="text-2xl font-bold text-blue-900">
                {occupancy}/{room.capacity || 4}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="h-3 rounded-full bg-blue-900 transition-all"
                style={{ width: `${(occupancy / (room.capacity || 4)) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Occupied</p>
                <p className="text-2xl font-bold text-emerald-600">{occupancy}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Available</p>
                <p className="text-2xl font-bold text-gray-600">{availability}</p>
              </div>
            </div>
          </div>

          {/* Your Info */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-900" />
              Your Information
            </h3>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
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
                <Users size={20} className="text-blue-900" />
                Your Roommates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roommates.map((roommate) => (
                  <div key={roommate._id} className="bg-blue-900/5 rounded-lg p-4 border border-blue-900/10">
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
                <Bed size={20} className="text-blue-900" />
                Facilities & Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {hostel.facilities.map((facility, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-blue-900/10 text-blue-900 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    <CheckCircle size={14} />
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {hostel.rulesAndPolicies && (
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hostel Rules & Policies</h3>
                <p className="text-gray-700 leading-relaxed">{hostel.rulesAndPolicies}</p>
              </div>
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
      <div className="bg-blue-900/5 border border-blue-900/10 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-900/80 text-sm">
          If you have questions about your room assignment or need to report maintenance issues, please
          contact the hostel office.
        </p>
      </div>
    </div>
  )
}
