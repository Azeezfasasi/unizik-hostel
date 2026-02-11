'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function EditBlogContent() {
	const router = useRouter()
	const params = useParams()
	const postId = params?.id

	const [formData, setFormData] = useState({
		postTitle: '',
		urlSlug: '',
		content: '',
		category: '',
		tags: [],
		author: '',
		featuredImage: null,
		featuredImagePreview: '',
		blogImages: [],
		blogImagePreviews: [],
		pdfFile: null,
		pdfFileName: '',
		pdfFileUrl: '',
		status: 'draft',
		publishDate: '',
	})

	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState(null)
	const [charCount, setCharCount] = useState(0)
	const [hasChanges, setHasChanges] = useState(false)
	const [categories, setCategories] = useState([])

	// Load post data from backend
	const loadPost = useCallback(async () => {
		try {
			setLoading(true)
			const response = await axios.get(`/api/blog`)
			const blog = response.data.find(b => b._id === postId)
			
			if (!blog) {
				setMessage({ type: 'error', text: 'Blog post not found' })
				return
			}

			setFormData({
				postTitle: blog.postTitle || '',
				urlSlug: blog.urlSlug || '',
				content: blog.content || '',
				category: blog.category || '',
				tags: Array.isArray(blog.tags) ? blog.tags : [],
				author: blog.author || '',
				featuredImage: null,
				featuredImagePreview: blog.featuredImage || '',
				blogImages: [],
				blogImagePreviews: Array.isArray(blog.blogImages) ? blog.blogImages : [],
				pdfFile: null,
				pdfFileName: blog.pdfFile ? 'existing-pdf' : '',
				pdfFileUrl: blog.pdfFile || '',
				status: blog.status || 'draft',
				publishDate: blog.publishDate ? new Date(blog.publishDate).toISOString().split('T')[0] : '',
			})
			setCharCount(blog.content?.length || 0)
		} catch (error) {
			console.error('Failed to load post:', error)
			setMessage({ type: 'error', text: 'Failed to load blog post' })
		} finally {
			setLoading(false)
		}
	}, [postId])

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

	useEffect(() => {
		loadPost()
	}, [loadPost])

	function handleInputChange(e) {
		const { name, value, type, checked } = e.target
		setFormData((prev) => {
			const updated = { ...prev }
			
			if (name === 'tags') {
				// Convert comma-separated string to array
				updated[name] = value.split(',').map(tag => tag.trim()).filter(tag => tag)
			} else if (type === 'checkbox') {
				updated[name] = checked
			} else {
				updated[name] = value
			}

			// Auto-generate slug from title
			if (name === 'postTitle') {
				updated.urlSlug = value
					.toLowerCase()
					.replace(/[^\w\s-]/g, '')
					.replace(/\s+/g, '-')
			}

			return updated
		})
		setHasChanges(true)
	}

	function handleContentChange(e) {
		const content = e.target.value
		setFormData((prev) => ({ ...prev, content }))
		setCharCount(content.length)
		setHasChanges(true)
	}

	function handleImageChange(e) {
		const file = e.target.files?.[0]
		if (file) {
			setFormData((prev) => ({ ...prev, featuredImage: file }))
			const reader = new FileReader()
			reader.onload = (event) => {
				setFormData((prev) => ({
					...prev,
					featuredImagePreview: event.target.result,
				}))
			}
			reader.readAsDataURL(file)
			setHasChanges(true)
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
						blogImagePreviews: [...prev.blogImagePreviews, ...previews]
					}))
				}
			}
			reader.readAsDataURL(file)
		})
		setHasChanges(true)
	}

	function removeBlogImage(index, isExisting = false) {
		if (isExisting) {
			setFormData(prev => ({
				...prev,
				blogImagePreviews: prev.blogImagePreviews.filter((_, i) => i !== index)
			}))
		} else {
			setFormData(prev => ({
				...prev,
				blogImages: prev.blogImages.filter((_, i) => i !== index),
				blogImagePreviews: prev.blogImagePreviews.filter((_, i) => i !== index)
			}))
		}
		setHasChanges(true)
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
				pdfFileName: file.name,
				pdfFileUrl: ''
			}))
			setHasChanges(true)
		}
	}

	function removePdf() {
		setFormData(prev => ({ 
			...prev, 
			pdfFile: null,
			pdfFileName: '',
			pdfFileUrl: ''
		}))
		setHasChanges(true)
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setSaving(true)
		setMessage(null)

		try {
			const data = new FormData()
			
			// Add blog fields
			data.append('postTitle', formData.postTitle)
			data.append('urlSlug', formData.urlSlug)
			data.append('content', formData.content)
			data.append('category', formData.category)
			data.append('author', formData.author)
			data.append('status', formData.status)
			// Send tags as comma-separated string, not JSON
			data.append('tags', formData.tags.join(', '))
			
			if (formData.publishDate) {
				data.append('publishDate', formData.publishDate)
			}
			
			// Add featured image if changed
			if (formData.featuredImage instanceof File) {
				data.append('featuredImage', formData.featuredImage)
			}
			
			// Add PDF file if new one is selected
			if (formData.pdfFile instanceof File) {
				data.append('pdfFile', formData.pdfFile)
			} else if (formData.pdfFileUrl) {
				// Keep existing PDF URL
				data.append('pdfFileUrl', formData.pdfFileUrl)
			}
			
			// Add existing blog image URLs (those that start with http or https)
			const existingImageUrls = []
			formData.blogImagePreviews.forEach((preview) => {
				if (preview && (preview.startsWith('http://') || preview.startsWith('https://'))) {
					existingImageUrls.push(preview)
				}
			})
			
			// Send existing image URLs as a JSON array
			if (existingImageUrls.length > 0) {
				data.append('existingBlogImages', JSON.stringify(existingImageUrls))
			}
			
			// Add only new File objects (those not starting with http)
			if (formData.blogImages && formData.blogImages.length > 0) {
				formData.blogImages.forEach((img) => {
					data.append('blogImages', img)
				})
			}

			// Call backend API to update blog
			await axios.put(`/api/blog/${postId}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			setMessage({ type: 'success', text: 'Blog post updated successfully!' })
			setHasChanges(false)
			setTimeout(() => {
				router.push('/dashboard/manage-blog')
			}, 1500)
		} catch (err) {
			console.error('Update error:', err)
			setMessage({ type: 'error', text: `Error: ${err.response?.data?.error || err.message}` })
		} finally {
			setSaving(false)
		}
	}

	function insertMarkdown(before, after) {
		const textarea = document.getElementById('content')
		const start = textarea.selectionStart
		const end = textarea.selectionEnd
		const text = textarea.value
		const selected = text.substring(start, end)
		const newText = text.substring(0, start) + before + selected + after + text.substring(end)

		setFormData((prev) => ({ ...prev, content: newText }))
		setCharCount(newText.length)
		setHasChanges(true)

		setTimeout(() => {
			textarea.focus()
			textarea.selectionStart = textarea.selectionEnd = start + before.length
		}, 0)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center py-12">
					<p className="text-gray-600">Loading post...</p>
				</div>
			</div>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['super admin', 'admin', 'staff']}>
		<div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header with Back Button */}
				<div className="mb-8 flex items-center gap-4">
					<Link
						href="/dashboard/manage-blog"
						className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Posts
					</Link>
				</div>

				{/* Title */}
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Blog Post</h1>
					<p className="mt-2 text-gray-600">Make changes to your blog post and publish updates.</p>
				</div>

				{/* Message Alert */}
				{message && (
					<div
						className={`mb-6 p-4 rounded-lg ${
							message.type === 'success'
								? 'bg-green-50 border border-green-200 text-green-800'
								: 'bg-red-50 border border-red-200 text-red-800'
						}`}
					>
						{message.text}
					</div>
				)}

				{/* Unsaved Changes Warning */}
				{hasChanges && (
					<div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
						You have unsaved changes. Remember to save before leaving this page.
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm space-y-6 p-6 md:p-8">
					{/* Post Information */}
					<fieldset>
						<legend className="text-lg font-semibold text-gray-900 mb-4">Post Information</legend>
						<div className="space-y-4">
						<div>
							<label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-2">
								Post Title *
							</label>
							<input
								type="text"
								id="postTitle"
								name="postTitle"
								value={formData.postTitle}
								onChange={handleInputChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
								placeholder="e.g., Getting Started with Next.js"
							/>
							<p className="text-xs text-gray-500 mt-1">This will appear as the main headline</p>
						</div>

						<div>
							<label htmlFor="urlSlug" className="block text-sm font-medium text-gray-700 mb-2">
								URL Slug
							</label>
							<input
								type="text"
								id="urlSlug"
								name="urlSlug"
								value={formData.urlSlug}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
								placeholder="auto-generated from title"
							/>
							<p className="text-xs text-gray-500 mt-1">Auto-generated from title, edit if needed</p>
						</div>							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
										Author *
									</label>
									<input
										type="text"
										id="author"
										name="author"
										value={formData.author}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
										placeholder="Author name"
									/>
								</div>
							<div>
								<label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
									Publish Date
								</label>
								<input
									type="date"
									id="publishDate"
									name="publishDate"
									value={formData.publishDate}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
								/>
							</div>
							</div>
						</div>
					</fieldset>

					{/* Content */}
					<div>
						<label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
							Content *
						</label>
						<div className="border border-gray-300 rounded-md overflow-hidden">
							{/* Text Editor Toolbar */}
							<div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => insertMarkdown('**', '**')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Bold"
								>
									<strong>B</strong>
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('*', '*')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Italic"
								>
									<em>I</em>
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('# ', '\n')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Heading"
								>
									H1
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('## ', '\n')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Subheading"
								>
									H2
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('- ', '\n')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Bullet List"
								>
									• List
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('[', '](url)')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Link"
								>
									🔗 Link
								</button>
								<button
									type="button"
									onClick={() => insertMarkdown('`', '`')}
									className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
									title="Code"
								>
									&lt;&gt; Code
								</button>
							</div>
							<textarea
								id="content"
								name="content"
								value={formData.content}
								onChange={handleContentChange}
								required
								rows="12"
								className="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm"
								placeholder="Write your blog post content here... Supports Markdown formatting"
							/>
						</div>
						<p className="text-xs text-gray-500 mt-2">{charCount} characters • Markdown supported</p>
					</div>

					{/* Category & Tags */}
					<fieldset>
						<legend className="text-lg font-semibold text-gray-900 mb-4">Organization</legend>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
									Category *
								</label>
								<select
									id="category"
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
								>
									<option value="" disabled>--Select a category--</option>
									{categories.map((cat) => (
										<option key={cat._id} value={cat._id}>{cat.name}</option>
									))}
								</select>
							</div>
						<div>
							<label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
								Tags
							</label>
							<input
								type="text"
								id="tags"
								name="tags"
								value={formData.tags.join(', ')}
								onChange={handleInputChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
								placeholder="Separate tags with commas"
							/>
							<p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
						</div>
						</div>
					</fieldset>

					{/* Featured Image */}
					<fieldset>
						<legend className="text-lg font-semibold text-gray-900 mb-4">Media</legend>
						<div>
							<label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
								Featured Image
							</label>

							{/* Image Preview */}
							{formData.featuredImagePreview && (
								<div className="mb-4 relative max-w-xs">
									<Image
										src={formData.featuredImagePreview}
										alt="Featured image preview"
										width={400}
										height={200}
										className="max-h-48 rounded-lg border border-gray-300"
									/>
									<button
										type="button"
										onClick={() =>
											setFormData((prev) => ({
												...prev,
												featuredImage: null,
												featuredImagePreview: '',
											}))
										}
										className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
									>
										Remove
									</button>
								</div>
							)}

							<div className="flex items-center justify-center w-full">
								<label
									htmlFor="featuredImage"
									className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="w-8 h-8 mb-2 text-gray-500" />
										<p className="text-sm text-gray-600">
											<span className="font-semibold">Click to upload</span> or drag and drop
										</p>
										<p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
									</div>
									<input
										type="file"
										id="featuredImage"
										name="featuredImage"
										onChange={handleImageChange}
										accept="image/*"
										className="hidden"
									/>
								</label>
							</div>
						</div>
					</fieldset>

					{/* Blog Images */}
					<fieldset>
						<legend className="text-lg font-semibold text-gray-900 mb-4">Blog Images</legend>
						<div>
							<label htmlFor="blogImages" className="block text-sm font-medium text-gray-700 mb-2">
								Additional Images
							</label>
							<input
								type="file"
								id="blogImages"
								name="blogImages"
								multiple
								onChange={handleBlogImagesChange}
								accept="image/*"
								className="w-full px-4 py-2 border border-gray-300 rounded-md"
							/>
							<p className="text-xs text-gray-500 mt-1">Upload multiple images to use in blog post</p>

							{/* Existing Blog Images Preview */}
							{formData.blogImagePreviews && formData.blogImagePreviews.length > 0 && (
								<div className="mt-4">
									<p className="text-sm font-medium text-gray-700 mb-2">Blog Images ({formData.blogImagePreviews.length})</p>
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
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</fieldset>

					{/* PDF File Upload */}
					<fieldset>
						<legend className="text-lg font-semibold text-gray-900 mb-4">PDF Document</legend>
						<div>
							<label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">
								PDF File (Optional)
							</label>
							<p className='text-blue-800 mb-2'>Upload a PDF file (up to 100MB) - will be displayed with PDF viewer</p>
							
							{/* Current PDF Preview */}
							{(formData.pdfFileName || formData.pdfFileUrl) && (
								<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
									<div className="flex items-center gap-3">
										<svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 11-2 0V6H7v4a1 1 0 11-2 0V5z" />
										</svg>
										<div>
											<p className="font-semibold text-blue-900">
												{formData.pdfFileName ? formData.pdfFileName : 'PDF Document'}
											</p>
											{formData.pdfFile && (
												<p className="text-xs text-blue-700">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
											)}
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
								<label 
									htmlFor="pdfFile" 
									className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
										</svg>
										<p className="text-sm text-gray-600">
											<span className="font-semibold">Click to upload</span> or drag and drop
										</p>
										<p className="text-xs text-gray-500">PDF file up to 10MB (Cloudinary free plan limit)</p>
									</div>
									<input 
										type="file" 
										id="pdfFile" 
										name="pdfFile" 
										onChange={handlePdfChange} 
										accept=".pdf" 
										className="hidden" 
									/>
								</label>
							</div>
						</div>
					</fieldset>

					{/* Publish Status */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">Publish Status</label>
						<div className="flex gap-4">
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="radio"
									name="status"
									value="published"
									checked={formData.status === 'published'}
									onChange={handleInputChange}
									className="w-4 h-4 rounded-full border-gray-300"
								/>
								<span className="text-sm font-medium text-gray-700">Published</span>
							</label>
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="radio"
									name="status"
									value="draft"
									checked={formData.status === 'draft'}
									onChange={handleInputChange}
									className="w-4 h-4 rounded-full border-gray-300"
								/>
								<span className="text-sm font-medium text-gray-700">Draft</span>
							</label>
						</div>
						<p className="text-xs text-gray-500 mt-2">Select the publication status for this post</p>
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-6 border-t">
						<button
							type="submit"
							disabled={saving}
							className="flex-1 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							{saving ? 'Saving...' : 'Save Changes'}
						</button>
						<Link
							href="/dashboard/manage-blog"
							className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
						>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</div>
		</ProtectedRoute>
	)
}

export default function EditBlogPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center py-12">
						<p className="text-gray-600">Loading post...</p>
					</div>
				</div>
			}
		>
			<EditBlogContent />
		</Suspense>
	)
}
