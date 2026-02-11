'use client';

import { useEffect, useState } from 'react';
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
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export default function CheckAvailability() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHostel, setFilterHostel] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [hostels, setHostels] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/room');
        const data = await res.json();

        if (data.success) {
          setRooms(data.data);
          // Extract unique hostels
          const uniqueHostels = [...new Set(data.data.map(r => r.hostelId?.name).filter(Boolean))];
          setHostels(uniqueHostels.sort());
        } else {
          setError('Failed to load rooms');
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Get available beds for a room
  const getAvailableBeds = (room) => {
    const occupied = room.assignedStudents?.length || 0;
    const available = room.capacity - occupied;
    return {
      available,
      occupied,
      total: room.capacity,
      occupancyPercent: Math.round((occupied / room.capacity) * 100),
    };
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const bedInfo = getAvailableBeds(room);
    
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomBlock?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hostelId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHostel = filterHostel === 'all' || room.hostelId?.name === filterHostel;

    const matchesPrice = 
      filterPrice === 'all' ||
      (filterPrice === 'budget' && room.price <= 100000) ||
      (filterPrice === 'mid' && room.price > 100000 && room.price <= 300000) ||
      (filterPrice === 'premium' && room.price > 300000);

    const hasAvailable = bedInfo.available > 0;

    return matchesSearch && matchesHostel && matchesPrice && hasAvailable;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3 flex-wrap">
            <Building2 className="w-8 h-8 text-purple-400" />
            Check Room Availability
          </h1>
          <p className="text-gray-300">Find available hostel rooms perfect for you</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room number, block, or hostel name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-purple-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Filter Toggle and Inline Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hostel Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">HOSTEL</label>
              <select
                value={filterHostel}
                onChange={(e) => setFilterHostel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-purple-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="all">All Hostels</option>
                {hostels.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">PRICE RANGE</label>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-purple-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget (≤ ₦100K)</option>
                <option value="mid">Mid-Range (₦100K - ₦300K)</option>
                <option value="premium">Premium (Above ₦300K)</option>
              </select>
            </div>

            {/* Results Info */}
            <div className="flex items-end">
              <div className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-purple-300">{filteredRooms.length}</span> rooms available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-300">Loading available rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
            <DoorOpen className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">No rooms available matching your criteria</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or checking back later</p>
          </div>
        ) : (
          <>
            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const bedInfo = getAvailableBeds(room);
                const availabilityStatus = (status) => {
                  if (bedInfo.available === bedInfo.total) return 'Fully Available';
                  if (bedInfo.available > 0) return 'Partially Available';
                  return 'Full';
                };

                return (
                  <div
                    key={room._id}
                    className="rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-slate-800 border border-slate-700 hover:border-purple-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/20"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">Room {room.roomNumber}</h3>
                          <p className="text-sm flex items-center gap-1 text-purple-100">
                            <MapPin className="w-4 h-4" />
                            {room.hostelId?.name || 'Unknown Hostel'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              bedInfo.available === bedInfo.total
                                ? 'bg-green-500 text-white'
                                : bedInfo.available > 0
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {bedInfo.available === bedInfo.total && '✓ Fully Available'}
                            {bedInfo.available > 0 && bedInfo.available < bedInfo.total && `${bedInfo.available} Available`}
                            {bedInfo.available === 0 && 'Full'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-4">
                      {/* Room Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Block</p>
                          <p className="text-white font-semibold text-lg">{room.roomBlock}</p>
                        </div>
                        <div className="bg-slate-700 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Floor</p>
                          <p className="text-white font-semibold text-lg">{room.roomFloor}</p>
                        </div>
                      </div>

                      {/* Bed Availability */}
                      <div className="bg-slate-700 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm flex items-center gap-1 text-gray-300">
                            <Users className="w-4 h-4" />
                            Beds
                          </p>
                          <span className="text-sm font-semibold text-white">
                            {bedInfo.occupied}/{bedInfo.total}
                          </span>
                        </div>

                        {/* Availability Bar */}
                        <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              bedInfo.occupancyPercent <= 50
                                ? 'bg-green-500'
                                : bedInfo.occupancyPercent <= 80
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${bedInfo.occupancyPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-gray-300">
                          <span>
                            <span className="font-semibold text-green-400">{bedInfo.available}</span> available
                          </span>
                          <span>{bedInfo.occupancyPercent}% occupied</span>
                        </div>
                      </div>

                      {/* Facilities */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-400">AMENITIES</p>
                          <div className="flex flex-wrap gap-2">
                            {room.facilities.includes('AC') && (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-900 text-blue-100">
                                <Wind className="w-3 h-3" /> AC
                              </span>
                            )}
                            {room.facilities.includes('WiFi') && (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-900 text-blue-100">
                                <Wifi className="w-3 h-3" /> WiFi
                              </span>
                            )}
                            {room.facilities.includes('Light') && (
                              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-900 text-blue-100">
                                <Lightbulb className="w-3 h-3" /> Light
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="border-t border-slate-600 pt-3">
                        <p className="text-xs text-gray-400 mb-1">Annual Fee</p>
                        <p className="text-2xl font-bold text-purple-300">
                          ₦{room.price?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ~₦{room.price ? Math.round(room.price / 12).toLocaleString() : 'N/A'}/month
                        </p>
                      </div>

                      {/* Action Button */}
                      <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition active:scale-95 text-sm">
                        Request This Room
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-900 border border-blue-500 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-blue-100 text-sm">
                <p className="font-semibold mb-1">Ready to book?</p>
                <p>Click "Request This Room" to submit your room request. Hostel administrators will review and notify you of approval status.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
