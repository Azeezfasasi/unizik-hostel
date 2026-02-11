"use client"

import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function AddBlogPage() {
  const [formData, setFormData] = useState({
    postTitle: '',
    urlSlug: '',
    content: '',
    category: '',
    tags: '',
    author: '',
    featuredImage: null,
    featuredImagePreview: '',
    blogImages: [],
    blogImagePreviews: [],
    pdfFile: null,
    pdfFileName: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [charCount, setCharCount] = useState(0)
  const [categories, setCategories] = useState([])

  // Fetch blog categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/blog-category')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
      
      // Auto-generate slug from title
      if (name === 'postTitle') {
        updated.urlSlug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      }

      return updated
    })
  }

  function handleContentChange(e) {
    const content = e.target.value
    setFormData(prev => ({ ...prev, content }))
    setCharCount(content.length)
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }))
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          featuredImagePreview: event.target?.result || ''
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  function handleBlogImagesChange(e) {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, blogImages: files }))
    
    // Generate previews
    const previews = []
    let loadedCount = 0
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        previews.push(event.target?.result || '')
        loadedCount++
        if (loadedCount === files.length) {
          setFormData(prev => ({
            ...prev,
            blogImagePreviews: previews
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function removeBlogImage(index) {
    setFormData(prev => ({
      ...prev,
      blogImages: prev.blogImages.filter((_, i) => i !== index),
      blogImagePreviews: prev.blogImagePreviews.filter((_, i) => i !== index)
    }))
  }

  function handlePdfChange(e) {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate PDF file
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please upload a valid PDF file' })
        return
      }
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit for Cloudinary free plan
      if (file.size > MAX_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setMessage({ type: 'error', text: `PDF file is too large (${sizeMB}MB). Cloudinary free plan supports maximum 10MB. Please compress the PDF or upgrade your Cloudinary plan.` })
        return
      }
      setFormData(prev => ({ 
        ...prev, 
        pdfFile: file,
        pdfFileName: file.name
      }))
    }
  }

  function removePdf() {
    setFormData(prev => ({ 
      ...prev, 
      pdfFile: null,
      pdfFileName: ''
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const data = new FormData()
      // Ensure all required fields are present
      const requiredFields = ['postTitle', 'urlSlug', 'author', 'content', 'category']
      for (const field of requiredFields) {
        if (!formData[field]) {
          setMessage({ type: 'error', text: `Missing required field: ${field}` })
          setLoading(false)
          return
        }
      }
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'blogImages' && Array.isArray(value)) {
          value.forEach((img, idx) => data.append('blogImages', img))
        } else if (value instanceof File) {
          data.append(key, value)
        } else if (value !== null && value !== '') {
          data.append(key, value)
        }
      })
      const response = await fetch('/api/blog', { method: 'POST', body: data })
      let result = null
      try {
        result = await response.json()
      } catch (err) {
        setMessage({ type: 'error', text: 'Invalid response from server.' })
        setLoading(false)
        return
      }
      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog post created successfully!' })
        setFormData({
          postTitle: '', urlSlug: '', content: '', category: '', tags: '', author: '', featuredImage: null, blogImages: [], pdfFile: null, pdfFileName: ''
        })
        setCharCount(0)
      } else {
        setMessage({ type: 'error', text: result.error || result.message || 'Failed to create blog post' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin', 'staff']}>
    <div className="min-h-screen bg-gray-50 py-6 px-0 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[20px] md:text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="mt-2 text-[14px] md:text-[16px] text-gray-600">Write and publish a new article for your website.</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm space-y-6 p-6 md:p-8">
          {/* Title & Slug */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">Post Information</legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-2">Post Title *</label>
                <input type="text" id="postTitle" name="postTitle" value={formData.postTitle} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Enter blog title" />
                <p className="text-xs text-gray-500 mt-1">This will appear as the main headline</p>
              </div>

              <div>
                <label htmlFor="urlSlug" className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                <input type="text" id="urlSlug" name="urlSlug" value={formData.urlSlug} onChange={handleInputChange} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50" placeholder="auto-generated from title" />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from title</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input type="text" id="author" name="author" value={formData.author} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Author name" />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
                    <option value="" disabled>--Select category--</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea id="content" name="content" value={formData.content} onChange={handleContentChange} required rows="12" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm" placeholder="Write your blog post content here... Supports Markdown formatting" />
            <p className="text-xs text-gray-500 mt-2">{charCount} characters • Markdown supported</p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Separate tags with commas (e.g., support, awareness)" />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          {/* Featured Image */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">Media</legend>
            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              
              {/* Featured Image Preview */}
              {formData.featuredImagePreview && (
                <div className="mb-4 relative max-w-xs">
                  <img src={formData.featuredImagePreview} alt="Featured image preview" className="max-h-48 rounded-lg border border-gray-300" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: null, featuredImagePreview: '' }))}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="featuredImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input type="file" id="featuredImage" name="featuredImage" onChange={handleImageChange} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="blogImages" className="block text-sm font-medium text-gray-700 mb-2 mt-4">Blog Images</label>
              <p className='text-green-800'>You can select up to 5 images</p>
              <input type="file" id="blogImages" name="blogImages" multiple onChange={handleBlogImagesChange} accept="image/*" className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              
              {/* Blog Images Preview Grid */}
              {formData.blogImagePreviews && formData.blogImagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Added Images ({formData.blogImagePreviews.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.blogImagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img src={preview} alt={`Blog image ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-300" />
                        <button
                          type="button"
                          onClick={() => removeBlogImage(idx)}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
                        >
                          <span className="text-white text-sm font-medium">Remove</span>
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{formData.blogImages[idx]?.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PDF File Upload */}
            <div className="mt-8 pt-8 border-t">
              <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">PDF File <span className='text-blue-500'>(Optional)</span></label>
              <p className='text-blue-800 mb-2'>Upload a PDF file (up to 5MB) - will be displayed with PDF Flip viewer</p>
              
              {/* PDF File Preview */}
              {formData.pdfFileName && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 11-2 0V6H7v4a1 1 0 11-2 0V5z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-blue-900">{formData.pdfFileName}</p>
                      <p className="text-xs text-blue-700">{(formData.pdfFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="pdfFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF file up to 10MB (Cloudinary free plan limit)</p>
                  </div>
                  <input type="file" id="pdfFile" name="pdfFile" onChange={handlePdfChange} accept=".pdf" className="hidden" />
                </label>
              </div>
            </div>
          </fieldset>

          {/* Message */}
          {message && (
            <div className={`mb-6 font-semibold p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-[14px] md:text-[16px] text-white font-medium py-2 px-0 md:px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button type="reset" className="flex-1 border border-red-200 text-gray-700 text-[14px] md:text-[16px] font-medium py-2 px-0 md:px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500">
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  )

  function insertMarkdown(before, after) {
    const textarea = document.getElementById('content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const newText = text.substring(0, start) + before + selected + after + text.substring(end)
    
    setFormData(prev => ({ ...prev, content: newText }))
    setCharCount(newText.length)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + before.length
    }, 0)
  }
}

