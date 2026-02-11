'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Save } from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/app/utils/galleryApi';

export default function WebsiteLogo() {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [width, setWidth] = useState(170);
  const [height, setHeight] = useState(50);
  const [alt, setAlt] = useState('CANAN USA Logo');
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logo');
      if (!response.ok) throw new Error('Failed to fetch logo');
      
      const data = await response.json();
      if (data.logo) {
        setLogo(data.logo);
        setWidth(data.logo.width);
        setHeight(data.logo.height);
        setAlt(data.logo.alt);
        setPreviewUrl(data.logo.url);
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setError('Failed to load logo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Create base64 preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result);
        reader.readAsDataURL(file);
      });

      const result = await uploadImageToCloudinary(base64, 'cananusa/logo');
      
      if (result && result.url) {
        // Save to backend
        const response = await fetch('/api/logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: result.url,
            publicId: result.publicId,
            width,
            height,
            alt,
          }),
        });

        if (!response.ok) throw new Error('Failed to save logo');

        const data = await response.json();
        setLogo(data.logo);
        setSuccess('Logo uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo');
      setPreviewUrl(logo?.url);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!logo) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/logo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: logo._id,
          width: parseInt(width),
          height: parseInt(height),
          alt,
        }),
      });

      if (!response.ok) throw new Error('Failed to update logo');

      const data = await response.json();
      setLogo(data.logo);
      setSuccess('Logo settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating logo:', err);
      setError('Failed to update logo settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !logo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading logo settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900">Website Logo</h1>
            <p className="text-gray-600 mt-2">Manage your website logo, including upload and size adjustments</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Current Logo Preview */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Logo Preview</h2>
                <div className="flex items-center justify-center bg-white p-6 rounded-lg border border-gray-200">
                  <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
                    <Image
                      src={previewUrl}
                      alt={alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Dimensions: {width}px × {height}px
                </p>
              </div>
            )}

            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload New Logo</h3>
                <p className="text-gray-600 mb-4">Drag and drop your logo or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-block px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Select File'}
                </button>
              </div>
            </div>

            {/* Size Settings */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Logo Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Width Input */}
                <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
                    Width (pixels)
                  </label>
                  <input
                    id="width"
                    type="number"
                    min="50"
                    max="500"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 170)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>

                {/* Height Input */}
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                    Height (pixels)
                  </label>
                  <input
                    id="height"
                    type="number"
                    min="30"
                    max="300"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Alt Text Input */}
              <div className="mt-6">
                <label htmlFor="alt" className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (for accessibility)
                </label>
                <input
                  id="alt"
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdateSettings}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Logo Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Recommended format: PNG with transparency</li>
                <li>✓ Maximum file size: 5MB</li>
                <li>✓ Width range: 50px - 500px</li>
                <li>✓ Height range: 30px - 300px</li>
                <li>✓ The logo will appear in the header and dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
