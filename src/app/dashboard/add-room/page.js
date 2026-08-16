'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCampus } from '@/context/CampusContext';
import { DoorOpen, ShieldAlert, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard-component/ui/PageHeader';
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton';
import { notify } from '@/components/dashboard-component/ui/toast';

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
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4 text-sm">You do not have permission to add rooms.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
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

      notify.success('Room created successfully!');
      setTimeout(() => {
        router.push('/dashboard/manage-rooms');
      }, 1200);
    } catch (err) {
      notify.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
      errors[field]
        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
        : 'border-gray-200 focus:ring-blue-900/20 focus:border-blue-900'
    }`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        icon={DoorOpen}
        title="Add New Room"
        subtitle="Create a new room in a hostel"
      />

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        {hostelsLoading ? (
          <PageSpinner label="Loading hostels..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hostel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Hostel <span className="text-red-500">*</span>
              </label>
              <select
                name="hostelId"
                value={formData.hostelId}
                onChange={handleInputChange}
                className={inputClass('hostelId')}
              >
                <option value="">-- Choose a Hostel --</option>
                {hostels.map(hostel => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name} ({hostel.hostelCampus})
                  </option>
                ))}
              </select>
              {errors.hostelId && <p className="text-red-500 text-xs mt-1">{errors.hostelId}</p>}
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
                  className={inputClass('roomNumber')}
                />
                {errors.roomNumber && <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>}
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
                  className={inputClass('roomBlock')}
                />
                {errors.roomBlock && <p className="text-red-500 text-xs mt-1">{errors.roomBlock}</p>}
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
                  className={inputClass('roomFloor')}
                />
                {errors.roomFloor && <p className="text-red-500 text-xs mt-1">{errors.roomFloor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputClass('status')}
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
                  className={inputClass('capacity')}
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
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
                  className={inputClass('currentOccupancy')}
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
                className={inputClass('price')}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Room Facilities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {COMMON_FACILITIES.map(facility => (
                  <label
                    key={facility}
                    className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility)}
                      onChange={() => handleFacilityToggle(facility)}
                      className="w-4 h-4 text-blue-900 rounded cursor-pointer focus:ring-blue-900/20"
                    />
                    <span className="text-gray-700">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating Room...' : 'Create Room'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
