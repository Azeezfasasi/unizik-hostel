'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notify } from '@/components/dashboard-component/ui/toast';
import PageHeader from '@/components/dashboard-component/ui/PageHeader';
import EmptyState from '@/components/dashboard-component/ui/EmptyState';
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton';
import {
  Building2,
  DoorOpen,
  Users,
  AlertCircle,
  Loader,
  MapPin,
  Wind,
  Wifi,
  Lightbulb,
  X,
  Search,
} from 'lucide-react';

export default function RequestRoomPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [hostels, setHostels] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [roomsRes, requestsRes] = await Promise.all([
          fetch('/api/room', { headers }),
          fetch('/api/room/requests?my=true', { headers }),
        ]);

        const roomsData = await roomsRes.json();
        const requestsData = await requestsRes.json();

        if (roomsData.success) {
          setRooms(roomsData.data);
          const uniqueHostels = [...new Set(roomsData.data.map((r) => r.hostelId?.name))].filter(Boolean);
          setHostels(uniqueHostels);
        } else {
          notify.error('Failed to load rooms');
        }

        if (requestsData.success && requestsData.requests) {
          setMyRequests(requestsData.requests);
        }
      } catch (err) {
        notify.error('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  // Filter rooms based on search and hostel filter
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomBlock?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostelId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHostel = filterHostel === 'all' || room.hostelId?.name === filterHostel;

    return matchesSearch && matchesHostel;
  });

  // Get available beds for a room
  const getAvailableBeds = (room) => {
    const occupied = room.assignedStudents?.length || 0;
    const available = room.capacity - occupied;
    return {
      available,
      occupied,
      total: room.capacity,
      beds: Array.from({ length: room.capacity }, (_, i) => ({
        index: i,
        occupied: room.assignedStudents?.[i] ? true : false,
      })),
    };
  };

  // Check if user has already requested a room
  const hasAlreadyRequested = (roomId) => {
    return myRequests.some((req) => req.room?._id === roomId && req.status === 'approved');
  };

  // Get user's pending request for a room
  const getPendingRequest = (roomId) => {
    return myRequests.find((req) => req.room?._id === roomId && req.status === 'approved');
  };

  // Handle bed selection
  const handleBedSelect = (room, bedIndex) => {
    setSelectedRoom(room);
    setSelectedBed(bedIndex);
  };

  // Handle room request submission
  const handleSubmitRequest = async (e) => {
    if (e) e.preventDefault?.();

    if (!selectedRoom || selectedBed === null) {
      notify.error('Please select a room and bed');
      return;
    }

    const userId = user?.id || user?._id;
    if (!userId) {
      notify.error('User not authenticated. Please log in again.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        roomId: selectedRoom._id,
        bed: selectedBed,
        studentId: userId,
      };

      const response = await fetch('/api/room/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Room request submitted! Check your requests in the room history.');
        setSelectedRoom(null);
        setSelectedBed(null);
        setSearchTerm('');

        setTimeout(() => {
          router.push('/dashboard/room-history');
        }, 1500);
      } else {
        notify.error(data.message || 'Failed to submit room request');
      }
    } catch (err) {
      notify.error('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Building2}
        title="Request a Room"
        subtitle="Find and request your perfect hostel room"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search room number or block..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
          />
        </div>

        <select
          value={filterHostel}
          onChange={(e) => setFilterHostel(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
        >
          <option value="all">All Hostels</option>
          {hostels.map((hostel) => (
            <option key={hostel} value={hostel}>
              {hostel}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <PageSpinner label="Loading available rooms..." />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms found"
          message="No rooms are available matching your search criteria right now."
        />
      ) : (
        <>
          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const bedInfo = getAvailableBeds(room);
              const isSelected = selectedRoom?._id === room._id;
              const alreadyRequested = hasAlreadyRequested(room._id);
              const pendingRequest = getPendingRequest(room._id);

              return (
                <div
                  key={room._id}
                  className={`rounded-2xl overflow-hidden bg-white border shadow-sm transition-all duration-200 ${
                    alreadyRequested
                      ? 'border-amber-200'
                      : isSelected
                      ? 'border-blue-900 ring-2 ring-blue-900/10'
                      : 'border-gray-100 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`p-4 ${
                      alreadyRequested ? 'bg-amber-50' : 'bg-blue-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            alreadyRequested ? 'text-amber-900' : 'text-white'
                          }`}
                        >
                          Room {room.roomNumber}
                        </h3>
                        <p
                          className={`text-sm flex items-center gap-1 ${
                            alreadyRequested ? 'text-amber-700' : 'text-blue-100'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                          {room.hostelId?.name}
                        </p>
                      </div>
                      {alreadyRequested && (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          Already Booked
                        </span>
                      )}
                      {!alreadyRequested && bedInfo.available > 0 && (
                        <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          Available
                        </span>
                      )}
                      {!alreadyRequested && bedInfo.available === 0 && (
                        <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          Full
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className={`p-4 space-y-4 ${alreadyRequested ? 'opacity-90' : ''}`}>
                    {/* Room Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                        <p className="text-xs text-gray-500">Block</p>
                        <p className="text-gray-900 font-semibold">{room.roomBlock}</p>
                      </div>
                      <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="text-gray-900 font-semibold">{room.roomFloor}</p>
                      </div>
                    </div>

                    {/* Bed Availability */}
                    <div className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs flex items-center gap-1 text-gray-500">
                          <Users className="w-4 h-4" />
                          Beds: {bedInfo.occupied}/{bedInfo.total}
                        </p>
                        <span
                          className={`text-xs font-semibold ${
                            bedInfo.available > 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {bedInfo.available} available
                        </span>
                      </div>
                      {!alreadyRequested && (
                        <div className="flex gap-1.5">
                          {bedInfo.beds.map((bed) => (
                            <button
                              key={bed.index}
                              onClick={() => !bed.occupied && handleBedSelect(room, bed.index)}
                              disabled={bed.occupied}
                              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                                bed.occupied
                                  ? 'bg-red-50 text-red-300 cursor-not-allowed'
                                  : isSelected && selectedBed === bed.index
                                  ? 'bg-blue-900 text-white ring-2 ring-blue-900/30'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-900 hover:text-blue-900'
                              }`}
                            >
                              {bed.index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      {alreadyRequested && (
                        <div className="text-center py-2">
                          <p className="text-amber-800 text-sm font-semibold">Your room assignment</p>
                          <p className="text-amber-700 text-xs">Bed {pendingRequest?.bed + 1}</p>
                        </div>
                      )}
                    </div>

                    {/* Facilities */}
                    {room.facilities && room.facilities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Facilities</p>
                        <div className="flex flex-wrap gap-2">
                          {room.facilities.includes('AC') && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-900">
                              <Wind className="w-3 h-3" /> AC
                            </span>
                          )}
                          {room.facilities.includes('WiFi') && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-900">
                              <Wifi className="w-3 h-3" /> WiFi
                            </span>
                          )}
                          {room.facilities.includes('Light') && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-900">
                              <Lightbulb className="w-3 h-3" /> Light
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500">Annual Price</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₦{room.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Room Details and Submission */}
          {selectedRoom && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
              onClick={() => {
                setSelectedRoom(null);
                setSelectedBed(null);
              }}
            >
              <div
                className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 border border-gray-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Confirm Your Request</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      setSelectedBed(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Confirmation Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Hostel</p>
                      <p className="text-gray-900 font-semibold">{selectedRoom.hostelId?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Room Number</p>
                      <p className="text-gray-900 font-semibold">{selectedRoom.roomNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-gray-500 text-sm">Block • Floor</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedRoom.roomBlock} • {selectedRoom.roomFloor}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Selected Bed</p>
                      <p className="font-semibold text-lg text-blue-900">Bed {selectedBed + 1}</p>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-900 text-sm">
                    Your request will be reviewed by the hostel administrator. You&apos;ll be notified once it&apos;s
                    approved or declined.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      setSelectedBed(null);
                    }}
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmitRequest();
                    }}
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
                  >
                    {submitting && <Loader className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
