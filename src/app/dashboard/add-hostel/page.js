'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const GENDERS = ['male', 'female', 'mixed'];
const COMMON_FACILITIES = [
  'WiFi',
  'Power Supply',
  'Water Supply',
  'Security',
  'Study Room',
  'Common Room',
  'Laundry',
  'Kitchen',
  'Medical Bay',
  'Library Access',
  'Sports Complex',
  'Parking'
];

export default function AddHostelPage() {
  const router = useRouter();
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    hostelCampus: '',
    block: '',
    floor: '',
    location: '',
    genderRestriction: 'mixed',
    description: '',
    facilities: [],
    rulesAndPolicies: ''
  });

  const [errors, setErrors] = useState({});

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to add hostels.</p>
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

    if (!formData.name.trim()) newErrors.name = 'Hostel name is required';
    if (!formData.hostelCampus.trim()) newErrors.hostelCampus = 'Campus is required';
    if (!formData.block.trim()) newErrors.block = 'Block is required';
    if (!formData.floor.trim()) newErrors.floor = 'Floor is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

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
      const response = await fetch('/api/hostel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create hostel');
      }

      setSuccess('Hostel created successfully!');
      setTimeout(() => {
        router.push('/dashboard/hostel-list');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Add New Hostel</h1>
          <p className="text-gray-600 text-sm sm:text-base">Fill in the details to create a new hostel</p>
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Name and Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Lions Hostel"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hostelCampus"
                  value={formData.hostelCampus}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Campus"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.hostelCampus ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hostelCampus && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.hostelCampus}</p>
                )}
              </div>
            </div>

            {/* Row 2: Block and Floor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  placeholder="e.g., Block A"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.block ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.block && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.block}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="e.g., Ground Floor"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.floor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.floor && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.floor}</p>}
              </div>
            </div>

            {/* Row 3: Location and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., North Campus Gate"
                  className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Restriction
                </label>
                <select
                  name="genderRestriction"
                  value={formData.genderRestriction}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the hostel..."
                rows="3"
                className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Facilities Available
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

            {/* Rules and Policies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules and Policies
              </label>
              <textarea
                name="rulesAndPolicies"
                value={formData.rulesAndPolicies}
                onChange={handleInputChange}
                placeholder="E.g., Lights out by 10 PM, No visitors after 8 PM..."
                rows="3"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                {loading ? 'Creating Hostel...' : 'Create Hostel'}
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
        </div>
      </div>
    </div>
  );
}
