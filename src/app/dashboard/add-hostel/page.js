'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, ShieldAlert, Loader2 } from 'lucide-react';
import PageHeader from '@/components/dashboard-component/ui/PageHeader';
import { notify } from '@/components/dashboard-component/ui/toast';

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
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4 text-sm">You do not have permission to add hostels.</p>
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

      notify.success('Hostel created successfully!');
      setTimeout(() => {
        router.push('/dashboard/hostel-list');
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
        icon={Building2}
        title="Add New Hostel"
        subtitle="Fill in the details to create a new hostel"
      />

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className={inputClass('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                className={inputClass('hostelCampus')}
              />
              {errors.hostelCampus && (
                <p className="text-red-500 text-xs mt-1">{errors.hostelCampus}</p>
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
                className={inputClass('block')}
              />
              {errors.block && <p className="text-red-500 text-xs mt-1">{errors.block}</p>}
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
                className={inputClass('floor')}
              />
              {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
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
                className={inputClass('location')}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
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
                className={inputClass('genderRestriction')}
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
              className={`${inputClass('description')} resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Facilities Available
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
              className={`${inputClass('rulesAndPolicies')} resize-none`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Hostel...' : 'Create Hostel'}
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
      </div>
    </div>
  );
}
