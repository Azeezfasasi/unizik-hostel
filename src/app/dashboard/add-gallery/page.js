'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { uploadImageToCloudinary } from '@/app/utils/galleryApi';
import { createGallery } from '@/app/utils/galleryApi';
import { Upload, X, Loader } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CATEGORIES = ['Hostel', 'event', 'maintenance', 'others'];
const TAGS = ['student', 'hostel', 'staff', 'event', 'maintenance', 'announcement', 'general'];

export default function AddGalleryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    featured: false,
    status: 'active',
    businessName: '',
    location: '',
    tags: [],
    media: [], // Contains both images and videos
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const isVideo = file.type.startsWith('video/');
          const isImage = file.type.startsWith('image/');

          if (!isImage && !isVideo) {
            setError(`${file.name} is not a valid image or video file`);
            resolve(null);
            return;
          }

          // Upload the file directly
          uploadImageToCloudinary(file, 'cananusa/gallery')
            .then(result => {
              setFormData(prev => ({
                ...prev,
                media: [...prev.media, {
                  url: result.url,
                  publicId: result.publicId,
                  alt: '',
                  type: isVideo ? 'video' : 'image',
                  displayOrder: prev.media.length,
                }],
              }));
              resolve(true);
            })
            .catch(err => {
              setError(`Failed to upload ${file.name}: ${err.message}`);
              reject(err);
            });
        });
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      setSuccess(`${files.length} file(s) uploaded successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.media.length === 0) {
      setError('At least one image or video is required');
      return;
    }

    setLoading(true);

    try {
      const response = await createGallery(formData);
      setSuccess('Gallery created successfully');

      setTimeout(() => {
        router.push('/dashboard/all-gallery');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin', 'staff']}>
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 mx-auto w-[95%] lg:w-full">
      <div className="max-w-2xl mx-auto px-0 sm:px-4 ml-[-10px] lg:ml-auto">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Add New Gallery</h1>
          <div className='bg-blue-50 p-2 border border-blue-200 rounded-lg mb-8'>
            <marquee className="text-blue-700 font-medium">You can add up to 10 <span className='text-red-600'>videos</span> or <span className='text-red-600'>images</span> for this gallery.</marquee>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className='text-red-600 text-[16px]'>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gallery title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gallery description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className='text-red-600 text-[16px]'>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location"
                />
              </div>
            </div>

            {/* Status and Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured Gallery</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images & Videos * (At least 1 required)
                <span className="block text-xs text-blue-600">You can upload multiple (images or videos) files at once up to 5MB.</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your images or videos here, or click to select
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    disabled={uploading}
                    className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, GIF, MP4, WebM, Ogg</p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Uploading files...</span>
              </div>
            )}

            {/* Uploaded Media Preview */}
            {formData.media.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploaded Media ({formData.media.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {formData.media.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === 'video' ? (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-24 sm:h-32 object-cover rounded-lg bg-black"
                        />
                      ) : (
                        <Image
                          src={media.url}
                          alt={media.alt || `Media ${index + 1}`}
                          width={200}
                          height={128}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="absolute top-1 left-1 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {media.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-red-500 text-white rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1">
                        {media.displayOrder + 1}/{formData.media.length}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading || uploading || formData.media.length === 0}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </span>
                ) : (
                  'Create Gallery'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-gray-800 py-2.5 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
