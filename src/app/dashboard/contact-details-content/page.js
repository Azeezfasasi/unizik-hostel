'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Loader, Copy, Check, MapPin } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import MapPreview from '@/components/MapPreview';

export default function ContactDetailsContent() {
  const [contactDetails, setContactDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    location: '',
    latitude: null,
    longitude: null,
    businessHours: '',
    facebookUrl: '',
    linkedinUrl: '',
    instagramUrl: ''
  });

  // Fetch contact details
  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contactdetails?includeInactive=true');
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const details = result.data[0];
        setContactDetails(details);
        setFormData({
          phone: details.phone || '',
          whatsapp: details.whatsapp || '',
          email: details.email || '',
          location: details.location || '',
          latitude: details.latitude || null,
          longitude: details.longitude || null,
          businessHours: details.businessHours || '',
          facebookUrl: details.facebookUrl || '',
          linkedinUrl: details.linkedinUrl || '',
          instagramUrl: details.instagramUrl || ''
        });
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-geocode when location changes
    if (name === 'location' && value.trim()) {
      handleGeocodeLocation(value);
    }
  };

  const handleGeocodeLocation = async (address) => {
    try {
      setGeocodingStatus('Geocoding...');
      const coordinates = await geocodeAddress(address);
      
      if (coordinates) {
        setFormData(prev => ({
          ...prev,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }));
        setGeocodingStatus('Location found!');
        setTimeout(() => setGeocodingStatus(''), 2000);
      } else {
        setGeocodingStatus('Location not found. Please check the address.');
        setTimeout(() => setGeocodingStatus(''), 3000);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingStatus('Error geocoding location');
      setTimeout(() => setGeocodingStatus(''), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone.trim() || !formData.whatsapp.trim() || !formData.email.trim() || 
        !formData.location.trim() || !formData.businessHours.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const url = contactDetails 
        ? `/api/contactdetails/${contactDetails._id}` 
        : '/api/contactdetails';
      
      const method = contactDetails ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(contactDetails ? 'Contact details updated successfully' : 'Contact details created successfully');
        setEditing(false);
        await fetchContactDetails();
      }
    } catch (error) {
      console.error('Error saving contact details:', error);
      alert('Error saving contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete these contact details?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/contactdetails/${contactDetails._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Contact details deleted successfully');
        setContactDetails(null);
        setFormData({
          phone: '',
          whatsapp: '',
          email: '',
          location: '',
          latitude: null,
          longitude: null,
          businessHours: '',
          facebookUrl: '',
          linkedinUrl: '',
          instagramUrl: ''
        });
      }
    } catch (error) {
      console.error('Error deleting contact details:', error);
      alert('Error deleting contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setGeocodingStatus('');
    if (contactDetails) {
      setFormData({
        phone: contactDetails.phone || '',
        whatsapp: contactDetails.whatsapp || '',
        email: contactDetails.email || '',
        location: contactDetails.location || '',
        latitude: contactDetails.latitude || null,
        longitude: contactDetails.longitude || null,
        businessHours: contactDetails.businessHours || '',
        facebookUrl: contactDetails.facebookUrl || '',
        linkedinUrl: contactDetails.linkedinUrl || '',
        instagramUrl: contactDetails.instagramUrl || ''
      });
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-0 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] md:text-3xl font-bold text-gray-900 mb-2">
            Contact Details - Content Management
          </h1>
          <p className="text-gray-600">
            Manage contact information displayed on the contact page
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editing ? 'Edit Contact Details' : contactDetails ? 'View Contact Details' : 'Add Contact Details'}
          </h2>

          {/* Edit/Delete Buttons - Outside Form */}
          {!editing && contactDetails && (
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={handleEdit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Edit2 size={18} />
                Edit Details
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number * 
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  maxLength={20}
                  placeholder="e.g., +1-234-567-8900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  disabled={!editing}
                  maxLength={20}
                  placeholder="e.g., +1-234-567-8900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="e.g., info@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!editing}
                  maxLength={200}
                  placeholder="e.g., Texas, USA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours *
              </label>
              <input
                type="text"
                id="businessHours"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleInputChange}
                disabled={!editing}
                maxLength={100}
                placeholder="e.g., Mon - Fri: 9:00 AM - 5:00 PM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Map Preview */}
            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Preview
                </label>
                {geocodingStatus && (
                  <p className={`text-sm mb-3 flex items-center gap-2 ${
                    geocodingStatus.includes('found') || geocodingStatus.includes('Geocoding')
                      ? 'text-blue-600'
                      : geocodingStatus.includes('not found')
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}>
                    <MapPin size={16} />
                    {geocodingStatus}
                  </p>
                )}
                <MapPreview 
                  latitude={formData.latitude} 
                  longitude={formData.longitude}
                  locationName={formData.location}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Map updates automatically as you enter the location
                </p>
              </div>
            )}

            {/* Social Media URLs */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebookUrl"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="https://linkedin.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    {contactDetails ? 'Update Details' : 'Create Details'}
                  </>
                )}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Current Details Display */}
        {contactDetails && !editing && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Contact Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 mb-3">Contact Methods</h3>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{contactDetails.phone}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(contactDetails.phone, 'phone')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'phone' ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="font-medium text-gray-800">{contactDetails.whatsapp}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(contactDetails.whatsapp, 'whatsapp')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'whatsapp' ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800 truncate">{contactDetails.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(contactDetails.email, 'email')}
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'email' ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Location & Hours */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 mb-3">Location & Hours</h3>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-800">{contactDetails.location}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Business Hours</p>
                  <p className="font-medium text-gray-800">{contactDetails.businessHours}</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            {(contactDetails.facebookUrl || contactDetails.linkedinUrl || contactDetails.instagramUrl) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-700 mb-3">Social Media</h3>
                <div className="flex gap-4">
                  {contactDetails.facebookUrl && (
                    <a
                      href={contactDetails.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                    >
                      Facebook
                    </a>
                  )}
                  {contactDetails.linkedinUrl && (
                    <a
                      href={contactDetails.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                    >
                      LinkedIn
                    </a>
                  )}
                  {contactDetails.instagramUrl && (
                    <a
                      href={contactDetails.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-sm hover:bg-pink-200 transition"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!contactDetails && !editing && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No contact details have been added yet.</p>
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Add Contact Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
