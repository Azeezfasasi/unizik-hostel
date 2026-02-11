'use client'
import React, { useState, useEffect } from 'react'
import { Save, Trash2, Plus, Upload } from 'lucide-react'

const defaultCoreValues = [
  {
    name: 'Faith & Spirituality',
    description: 'Rooted in Christian principles and values that guide our mission.',
    iconType: 'circle',
    colorClass: 'blue-900'
  },
  {
    name: 'Justice & Advocacy',
    description: 'Defending religious freedom and protecting persecuted believers.',
    iconType: 'circle',
    colorClass: 'amber-600'
  },
  {
    name: 'Community & Unity',
    description: 'Strengthening bonds among Nigerian-Americans and building collective strength.',
    iconType: 'circle',
    colorClass: 'green-700'
  },
  {
    name: 'Compassion & Humanity',
    description: 'Supporting and uplifting vulnerable Christians with humanitarian aid.',
    iconType: 'circle',
    colorClass: 'red-600'
  },
  {
    name: 'Empowerment',
    description: 'Enabling Nigerian-Americans to thrive professionally, socially, and spiritually.',
    iconType: 'circle',
    colorClass: 'purple-600'
  }
]

const defaultOverview = {
  whoWeAre: {
    title: 'Who We Are',
    paragraphs: [
      'The Christian Association of Nigerian-Americans (CANAN USA) is a national Christian advocacy organization dedicated to defending religious freedom, protecting persecuted Christians, and strengthening Nigerian-American communities across the United States.',
      'We collaborate with churches, civic leaders, human rights organizations, and U.S. policymakers to ensure that the cry of persecuted believers is heard, addressed, and acted upon.'
    ]
  },
  vision: {
    title: 'Our Vision',
    description: 'A world where Nigerian Christians live in safety, dignity, and freedom and where Nigerian Americans thrive as a united, empowered Christian community in the U.S.'
  },
  mission: {
    title: 'Our Mission',
    description: 'To mobilize Christians, influence policy, and provide humanitarian support to protect persecuted Christians in Nigeria and uplift Nigerian American communities.'
  },
  coreValues: {
    title: 'Our Core Values',
    values: defaultCoreValues
  },
  image: {
    url: '/images/placeholder.png',
    alt: 'CANAN USA Overview'
  }
}

export default function CompanyOverviewContent() {
  const [overview, setOverview] = useState(defaultOverview)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [overviewId, setOverviewId] = useState(null)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/company-overview')
      const result = await res.json()

      if (result.success && result.data) {
        setOverview(result.data)
        setOverviewId(result.data._id)
      } else {
        setOverview(defaultOverview)
      }
    } catch (err) {
      setError('Failed to fetch company overview')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formDataForUpload = new FormData()
      formDataForUpload.append('file', file)
      formDataForUpload.append('folder', 'cananusa/company-overview')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataForUpload
      })

      if (response.ok) {
        const result = await response.json()
        setOverview({
          ...overview,
          image: {
            ...overview.image,
            url: result.secure_url
          }
        })
        setSuccess('Image uploaded successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      const method = overviewId ? 'PUT' : 'POST'
      const url = overviewId ? `/api/company-overview/${overviewId}` : '/api/company-overview'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overview)
      })

      const result = await res.json()

      if (result.success) {
        setSuccess('Company overview saved successfully!')
        if (!overviewId && result.data) {
          setOverviewId(result.data._id)
        }
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save company overview')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-3 sm:p-4 md:p-6"><p className="text-gray-600 text-sm">Loading...</p></div>
  }

  return (
    <div className="p-0 sm:p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Company Overview Management</h1>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {success}
        </div>
      )}

      <div className="space-y-6 sm:space-y-8 bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
        {/* Image Section */}
        <section className="border-b pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Company Image</h2>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <div className="flex items-center gap-2">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>

            {/* Or Image URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Or Enter Image URL</label>
              <input
                type="text"
                value={overview.image?.url || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  image: { ...overview.image, url: e.target.value }
                })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use uploaded image or paste URL directly</p>
            </div>

            {/* Image Preview */}
            {overview.image?.url && (
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Preview</p>
                <img
                  src={overview.image.url}
                  alt={overview.image.alt || 'Company overview'}
                  className="max-w-full sm:max-w-md h-auto rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png'
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
              <input
                type="text"
                value={overview.image?.alt || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  image: { ...overview.image, alt: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="border-b pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={overview.whoWeAre?.title || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  whoWeAre: { ...overview.whoWeAre, title: e.target.value }
                })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            {overview.whoWeAre?.paragraphs?.map((para, idx) => (
              <div key={idx}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Paragraph {idx + 1}</label>
                <textarea
                  value={para || ''}
                  onChange={(e) => {
                    const newParagraphs = [...(overview.whoWeAre?.paragraphs || [])]
                    newParagraphs[idx] = e.target.value
                    setOverview({
                      ...overview,
                      whoWeAre: { ...overview.whoWeAre, paragraphs: newParagraphs }
                    })
                  }}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">{(para || '').length}/500</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision Section */}
        <section className="border-b pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Vision</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={overview.vision?.title || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  vision: { ...overview.vision, title: e.target.value }
                })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={overview.vision?.description || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  vision: { ...overview.vision, description: e.target.value }
                })}
                maxLength={1000}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{(overview.vision?.description || '').length}/1000</p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="border-b pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Mission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={overview.mission?.title || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  mission: { ...overview.mission, title: e.target.value }
                })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={overview.mission?.description || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  mission: { ...overview.mission, description: e.target.value }
                })}
                maxLength={1000}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{(overview.mission?.description || '').length}/1000</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Core Values</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={overview.coreValues?.title || ''}
                onChange={(e) => setOverview({
                  ...overview,
                  coreValues: { ...overview.coreValues, title: e.target.value }
                })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {overview.coreValues?.values?.map((value, idx) => (
              <div key={idx} className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Value Name</label>
                    <input
                      type="text"
                      value={value.name || ''}
                      onChange={(e) => {
                        const newValues = [...(overview.coreValues?.values || [])]
                        newValues[idx].name = e.target.value
                        setOverview({
                          ...overview,
                          coreValues: { ...overview.coreValues, values: newValues }
                        })
                      }}
                      maxLength={50}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Color</label>
                    <select
                      value={value.colorClass || 'blue-900'}
                      onChange={(e) => {
                        const newValues = [...(overview.coreValues?.values || [])]
                        newValues[idx].colorClass = e.target.value
                        setOverview({
                          ...overview,
                          coreValues: { ...overview.coreValues, values: newValues }
                        })
                      }}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="blue-900">Blue</option>
                      <option value="amber-600">Amber</option>
                      <option value="green-700">Green</option>
                      <option value="red-600">Red</option>
                      <option value="purple-600">Purple</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={value.description || ''}
                    onChange={(e) => {
                      const newValues = [...(overview.coreValues?.values || [])]
                      newValues[idx].description = e.target.value
                      setOverview({
                        ...overview,
                        coreValues: { ...overview.coreValues, values: newValues }
                      })
                    }}
                    maxLength={200}
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(value.description || '').length}/200</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
        )}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
