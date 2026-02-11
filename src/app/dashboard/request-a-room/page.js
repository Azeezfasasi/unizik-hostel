'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  DoorOpen,
  Users,
  Check,
  AlertCircle,
  Loader,
  MapPin,
  Wind,
  Wifi,
  Lightbulb,
  X,
} from 'lucide-react';

export default function RequestRoomPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [roomsRes, requestsRes] = await Promise.all([
          fetch('/api/room', { headers }),
          fetch('/api/room/requests?my=true', { headers }),
        ]);

        const roomsData = await roomsRes.json();
        const requestsData = await requestsRes.json();

        if (roomsData.success) {
          setRooms(roomsData.data);
          // Extract unique hostels
          const uniqueHostels = [...new Set(roomsData.data.map(r => r.hostelId?.name))];
          setHostels(uniqueHostels);
        } else {
          setError('Failed to load rooms');
        }

        // Store user's requests
        if (requestsData.success && requestsData.requests) {
          setMyRequests(requestsData.requests);
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Filter rooms based on search and hostel filter
  const filteredRooms = rooms.filter(room => {
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
    return myRequests.some(req => req.room?._id === roomId && req.status === 'approved');
  };

  // Get user's pending request for a room
  const getPendingRequest = (roomId) => {
    return myRequests.find(req => req.room?._id === roomId && req.status === 'approved');
  };

  // Handle bed selection
  const handleBedSelect = (room, bedIndex) => {
    setSelectedRoom(room);
    setSelectedBed(bedIndex);
  };

  // Handle room request submission
  const handleSubmitRequest = async (e) => {
    if (e) e.preventDefault?.();

    console.log('Submit clicked - selectedRoom:', selectedRoom, 'selectedBed:', selectedBed, 'user:', user);

    if (!selectedRoom || selectedBed === null) {
      console.log('Validation failed - no room or bed selected');
      setError('Please select a room and bed');
      return;
    }

    // Check for user ID - support both id and _id
    const userId = user?.id || user?._id;
    if (!userId) {
      console.log('User not authenticated - no id or _id found');
      setError('User not authenticated. Please log in again.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        roomId: selectedRoom._id,
        bed: selectedBed,
        studentId: userId,
      };

      console.log('Sending request with payload:', payload);

      const response = await fetch('/api/room/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const data = await response.json();

      console.log('Response data:', data);

      if (data.success) {
        setSuccess('Room request submitted successfully! Check your requests in the room history.');
        setSelectedRoom(null);
        setSelectedBed(null);
        setSearchTerm('');

        // Reset and redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/room-history');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit room request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-purple-400" />
            Request a Room
          </h1>
          <p className="text-gray-300">Find and request your perfect hostel room</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-900 border border-green-500 rounded-lg p-4 flex items-start gap-3 animate-pulse">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-100">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search room number or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-purple-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Hostel Filter */}
          <div>
            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-purple-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Hostels</option>
              {hostels.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-300">Loading available rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <DoorOpen className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">No rooms available matching your criteria</p>
          </div>
        ) : (
          <>
            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredRooms.map((room) => {
                const bedInfo = getAvailableBeds(room);
                const isSelected = selectedRoom?._id === room._id;
                const alreadyRequested = hasAlreadyRequested(room._id);
                const pendingRequest = getPendingRequest(room._id);

                return (
                  <div
                    key={room._id}
                    className={`rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                      alreadyRequested
                        ? 'bg-yellow-900 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-600 border-2 border-purple-400 shadow-2xl cursor-pointer'
                        : 'bg-slate-800 border border-slate-700 hover:border-purple-500 cursor-pointer'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r p-4 ${
                      alreadyRequested
                        ? 'from-yellow-600 to-yellow-700'
                        : 'from-purple-600 to-purple-700'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">Room {room.roomNumber}</h3>
                          <p className={`text-sm flex items-center gap-1 ${
                            alreadyRequested ? 'text-yellow-100' : 'text-purple-100'
                          }`}>
                            <MapPin className="w-4 h-4" />
                            {room.hostelId?.name}
                          </p>
                        </div>
                        {alreadyRequested && (
                          <span className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full text-xs font-semibold">
                            ✓ Already Booked
                          </span>
                        )}
                        {!alreadyRequested && bedInfo.available > 0 && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Available
                          </span>
                        )}
                        {!alreadyRequested && bedInfo.available === 0 && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Full
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={`p-4 space-y-4 ${alreadyRequested ? 'opacity-75' : ''}`}>
                      {/* Room Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`rounded-lg p-3 ${
                          alreadyRequested ? 'bg-yellow-800' : 'bg-slate-700'
                        }`}>
                          <p className="text-xs text-gray-400">Block</p>
                          <p className="text-white font-semibold">{room.roomBlock}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${
                          alreadyRequested ? 'bg-yellow-800' : 'bg-slate-700'
                        }`}>
                          <p className="text-xs text-gray-400">Floor</p>
                          <p className="text-white font-semibold">{room.roomFloor}</p>
                        </div>
                      </div>

                      {/* Bed Availability */}
                      <div className={`rounded-lg p-3 ${
                        alreadyRequested ? 'bg-yellow-800' : 'bg-slate-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs flex items-center gap-1 ${
                            alreadyRequested ? 'text-yellow-200' : 'text-gray-400'
                          }`}>
                            <Users className="w-4 h-4" />
                            Beds: {bedInfo.occupied}/{bedInfo.total}
                          </p>
                          <span className={`text-xs font-semibold ${
                            bedInfo.available > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
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
                                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                                  bed.occupied
                                    ? 'bg-red-900 text-red-300 cursor-not-allowed'
                                    : isSelected && selectedBed === bed.index
                                    ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                                    : 'bg-slate-600 text-white hover:bg-slate-500'
                                }`}
                              >
                                {bed.index + 1}
                              </button>
                            ))}
                          </div>
                        )}
                        {alreadyRequested && (
                          <div className="text-center py-2">
                            <p className="text-yellow-100 text-sm font-semibold">Your room assignment</p>
                            <p className="text-yellow-200 text-xs">Bed {pendingRequest?.bed + 1}</p>
                          </div>
                        )}
                      </div>

                      {/* Facilities */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="space-y-2">
                          <p className={`text-xs font-semibold ${
                            alreadyRequested ? 'text-yellow-300' : 'text-gray-400'
                          }`}>Facilities</p>
                          <div className="flex flex-wrap gap-2">
                            {room.facilities.includes('AC') && (
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                alreadyRequested
                                  ? 'bg-yellow-700 text-yellow-100'
                                  : 'bg-blue-900 text-blue-100'
                              }`}>
                                <Wind className="w-3 h-3" /> AC
                              </span>
                            )}
                            {room.facilities.includes('WiFi') && (
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                alreadyRequested
                                  ? 'bg-yellow-700 text-yellow-100'
                                  : 'bg-blue-900 text-blue-100'
                              }`}>
                                <Wifi className="w-3 h-3" /> WiFi
                              </span>
                            )}
                            {room.facilities.includes('Light') && (
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                alreadyRequested
                                  ? 'bg-yellow-700 text-yellow-100'
                                  : 'bg-blue-900 text-blue-100'
                              }`}>
                                <Lightbulb className="w-3 h-3" /> Light
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className={`border-t pt-3 ${
                        alreadyRequested ? 'border-yellow-700' : 'border-slate-600'
                      }`}>
                        <p className={`text-xs ${
                          alreadyRequested ? 'text-yellow-300' : 'text-gray-400'
                        }`}>Annual Price</p>
                        <p className={`text-2xl font-bold ${
                          alreadyRequested ? 'text-yellow-300' : 'text-purple-300'
                        }`}>
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => {
                setSelectedRoom(null);
                setSelectedBed(null);
              }}>
                <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 space-y-6 border border-purple-500" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Confirm Your Request</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoom(null);
                        setSelectedBed(null);
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Confirmation Details */}
                  <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-sm">Hostel</p>
                        <p className="text-white font-semibold">{selectedRoom.hostelId?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Room Number</p>
                        <p className="text-white font-semibold">{selectedRoom.roomNumber}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pt-3 border-t border-slate-600">
                      <div>
                        <p className="text-gray-400 text-sm">Block • Floor</p>
                        <p className="text-white font-semibold">
                          {selectedRoom.roomBlock} • {selectedRoom.roomFloor}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Selected Bed</p>
                        <p className="font-semibold text-lg text-yellow-400">
                          Bed {selectedBed + 1}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-blue-900 border border-blue-500 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-100 text-sm">
                      Your request will be reviewed by the hostel administrator. You'll be notified once it's approved or declined.
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
                      className={`flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold transition ${
                        submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600 active:scale-95'
                      }`}
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
                      className={`flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        submitting
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:from-purple-700 hover:to-purple-800 active:scale-95'
                      }`}
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
    </div>
  );
}
