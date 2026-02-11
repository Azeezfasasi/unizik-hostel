'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Plus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AddStudents() {
  const { isAuthenticated, loading: authLoading, token, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [students, setStudents] = useState([{ firstName: '', lastName: '', email: '', password: '' }])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  const handleInputChange = (index, field, value) => {
    const newStudents = [...students]
    newStudents[index][field] = value
    setStudents(newStudents)
  }

  const addStudentRow = () => {
    setStudents([...students, { firstName: '', lastName: '', email: '', password: '', matricNumber: '', phone: '' }])
  }

  const removeStudentRow = (index) => {
    setStudents(students.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    for (const student of students) {
      if (!student.firstName.trim() || !student.lastName.trim() || !student.email.trim() || !student.password.trim()) {
        setError('All required fields must be filled')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        setError('Invalid email format')
        return false
      }
      if (student.password.length < 4) {
        setError('Password must be at least 4 characters')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    try {
      setLoading(true)
      const createdStudents = []

      for (const student of students) {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: student.firstName,
            lastName: student.lastName,
            otherName: student.otherName || '',
            email: student.email,
            password: student.password,
            confirmPassword: student.password,
            matricNumber: student.matricNumber || '',
            phone: student.phone || '',
            role: 'student'
          })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create student')
        createdStudents.push(data.user)
      }

      setSuccess(true)
      setStudents([{ firstName: '', lastName: '', email: '', password: '' }])
      setTimeout(() => {
        router.push('/dashboard/all-students')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create students')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-blue-600 animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Add Students</h1>
          <p className="text-gray-600 mt-1">Create new student accounts</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              You can add one or multiple students at once. Fill in the required fields (First Name, Last Name, Email, Password) to create new student accounts. Optional fields can be left blank.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-700">Students created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Students Form */}
            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Student {index + 1}</h3>
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentRow(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={student.firstName}
                        onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={student.lastName}
                        onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                      <input
                        type="text"
                        value={student.otherName || ''}
                        onChange={(e) => handleInputChange(index, 'otherName', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={student.email}
                        onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                      <input
                        type="text"
                        value={student.matricNumber || ''}
                        onChange={(e) => handleInputChange(index, 'matricNumber', e.target.value)}
                        placeholder="2022/12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={student.phone || ''}
                        onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                        placeholder="+234 xxx xxxx xxxx"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={student.password}
                        onChange={(e) => handleInputChange(index, 'password', e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              type="button"
              onClick={addStudentRow}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors border border-blue-300"
            >
              <Plus size={20} />
              Add Another Student
            </button>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="inline-block animate-spin mr-2" size={18} />
                    Creating...
                  </>
                ) : (
                  'Create Students'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
