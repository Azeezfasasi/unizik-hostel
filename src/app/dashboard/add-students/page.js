'use client'

import React, { useState } from 'react'
import { Plus, X, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import PageHeader from '@/components/dashboard-component/ui/PageHeader'
import { notify } from '@/components/dashboard-component/ui/toast'

export default function AddStudents() {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([{ firstName: '', lastName: '', email: '', password: '' }])

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
        notify.error('All required fields must be filled')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        notify.error('Invalid email format')
        return false
      }
      if (student.password.length < 4) {
        notify.error('Password must be at least 4 characters')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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

      notify.success('Students created successfully')
      setStudents([{ firstName: '', lastName: '', email: '', password: '' }])
      setTimeout(() => {
        router.push('/dashboard/all-students')
      }, 1200)
    } catch (err) {
      notify.error(err.message || 'Failed to create students')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['super admin', 'admin']}>
      <div className="max-w-7xl mx-auto space-y-6 mt-4 md:mt-8">
        <PageHeader
          icon={UserPlus}
          title="Add Students"
          subtitle="Create new student accounts"
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              You can add one or multiple students at once. Fill in the required fields (First Name, Last Name, Email, Password) to create new student accounts. Optional fields can be left blank.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Students Form */}
            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
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
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={student.lastName}
                        onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                        placeholder="Doe"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                      <input
                        type="text"
                        value={student.otherName || ''}
                        onChange={(e) => handleInputChange(index, 'otherName', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={student.email}
                        onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                      <input
                        type="text"
                        value={student.matricNumber || ''}
                        onChange={(e) => handleInputChange(index, 'matricNumber', e.target.value)}
                        placeholder="2022/12345"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={student.phone || ''}
                        onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                        placeholder="+234 xxx xxxx xxxx"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={student.password}
                        onChange={(e) => handleInputChange(index, 'password', e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-blue-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus size={18} />
              Add Another Student
            </button>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Students'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
