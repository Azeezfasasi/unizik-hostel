'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCampus } from '@/context/CampusContext';

const COMMON_FACILITIES = [
  'Bed',
  'Study Desk',
  'Cupboard',
  'Shelves',
  'Window',
  'AC',
  'Fan',
  'Light',
  'Power Points',
  'Internet',
  'Locker',
  'Mirror'
];

const ROOM_STATUSES = ['available', 'occupied', 'under-maintenance'];

export default function AddRoomPage() {
  const router = useRouter();
  const { token, isAdmin } = useAuth();
  const { hostels, loading: hostelsLoading } = useCampus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    hostelId: '',
    roomNumber: '',
    roomBlock: '',
    roomFloor: '',
    capacity: '',
    currentOccupancy: '0',
    price: '',
    facilities: [],
    status: 'available'
  });

  const [errors, setErrors] = useState({});

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to add rooms.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.hostelId) newErrors.hostelId = 'Hostel is required';
    if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!formData.roomBlock.trim()) newErrors.roomBlock = 'Block is required';
    if (!formData.roomFloor.trim()) newErrors.roomFloor = 'Floor is required';
    if (!formData.capacity || parseInt(formData.capacity) < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.price || parseInt(formData.price) < 0) newErrors.price = 'Price is required and must be non-negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          currentOccupancy: parseInt(formData.currentOccupancy) || 0,
          price: parseInt(formData.price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      setSuccess('Room created successfully!');
      setTimeout(() => {
        router.push('/dashboard/manage-rooms');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Add New Room</h1>
          <p className="text-gray-600 text-sm sm:text-base">Create a new room in a hostel</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-red-700 text-sm sm:text-base flex items-start gap-2">
              <span className="text-lg">❌</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <p className="text-green-700 text-sm sm:text-base flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          {hostelsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Hostel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hostel <span className="text-red-500">*</span>
                </label>
                <select
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.hostelId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Choose a Hostel --</option>
                  {hostels.map(hostel => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name} ({hostel.hostelCampus})
                    </option>
                  ))}
                </select>
                {errors.hostelId && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.hostelId}</p>}
              </div>

              {/* Row 1: Room Number and Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., Room 101"
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.roomNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.roomNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roomBlock"
                    value={formData.roomBlock}
                    onChange={handleInputChange}
                    placeholder="e.g., Block A"
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.roomBlock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.roomBlock && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.roomBlock}</p>}
                </div>
              </div>

              {/* Row 2: Floor and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roomFloor"
                    value={formData.roomFloor}
                    onChange={handleInputChange}
                    placeholder="e.g., Ground Floor"
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.roomFloor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.roomFloor && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.roomFloor}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {ROOM_STATUSES.map(status => (
                      <option key={status} value={status}>
                        {status.replaceAll('-', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Capacity and Current Occupancy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Beds) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 4"
                    min="1"
                    className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.capacity && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Occupancy</label>
                  <input
                    type="number"
                    name="currentOccupancy"
                    value={formData.currentOccupancy}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    min="0"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  min="0"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Room Facilities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {COMMON_FACILITIES.map(facility => (
                    <label key={facility} className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition text-sm">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
                >
                  {loading ? 'Creating Room...' : 'Create Room'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-400 transition font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
