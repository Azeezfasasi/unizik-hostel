'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Modal Components
function ViewModal({ hostel, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-4 sm:p-6 sticky top-0">
          <h2 className="text-xl sm:text-2xl font-bold pr-8 break-words">{hostel?.name}</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-blue-700 p-2 rounded"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-semibold">Campus</p>
              <p className="text-gray-900 font-medium text-sm">{hostel?.hostelCampus}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-semibold">Block</p>
              <p className="text-gray-900 font-medium text-sm">{hostel?.block}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-semibold">Floor</p>
              <p className="text-gray-900 font-medium text-sm">{hostel?.floor}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-semibold">Gender</p>
              <p className="text-gray-900 font-medium text-sm capitalize">{hostel?.genderRestriction}</p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-600 text-xs sm:text-sm font-semibold">Location</p>
            <p className="text-gray-900 font-medium text-sm">{hostel?.location}</p>
          </div>

          <div>
            <p className="text-gray-600 text-xs sm:text-sm font-semibold">Description</p>
            <p className="text-gray-900 text-sm">{hostel?.description}</p>
          </div>

          {hostel?.facilities?.length > 0 && (
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-semibold">Facilities</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {hostel.facilities.map((facility, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-gray-600 text-xs sm:text-sm font-semibold">Rules & Policies</p>
            <p className="text-gray-900 text-sm">{hostel?.rulesAndPolicies}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 sm:mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ hostel, isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(hostel || {});

  useEffect(() => {
    setFormData(hostel || {});
  }, [hostel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-yellow-500 text-white p-4 sm:p-6 sticky top-0">
          <h2 className="text-xl sm:text-2xl font-bold pr-8">Edit Hostel</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-yellow-600 p-2 rounded"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Hostel Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Campus</label>
              <input
                type="text"
                name="hostelCampus"
                value={formData.hostelCampus || ''}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Block</label>
              <input
                type="text"
                name="block"
                value={formData.block || ''}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Floor</label>
              <input
                type="text"
                name="floor"
                value={formData.floor || ''}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Gender Restriction</label>
              <select
                name="genderRestriction"
                value={formData.genderRestriction || 'mixed'}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Rules & Policies</label>
            <textarea
              name="rulesAndPolicies"
              value={formData.rulesAndPolicies || ''}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ hostel, isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-red-600 text-white p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold pr-8">Delete Hostel</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-red-700 p-2 rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Are you sure you want to delete <strong>{hostel?.name}</strong>? This action cannot be undone.
          </p>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function HostelListPage() {
  const { isAdmin } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, hostel: null });
  const [editModal, setEditModal] = useState({ isOpen: false, hostel: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, hostel: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch hostels
  const fetchHostels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hostel');
      const data = await res.json();
      if (data.success) {
        setHostels(data.data);
        // Extract unique campuses
        const uniqueCampuses = [...new Set(data.data.map(h => h.hostelCampus))];
        setCampuses(uniqueCampuses);
      }
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  // Filter and search hostels
  useEffect(() => {
    let filtered = hostels;

    if (selectedCampus) {
      filtered = filtered.filter(h => h.hostelCampus === selectedCampus);
    }

    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHostels(filtered);
    setCurrentPage(1);
  }, [hostels, selectedCampus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredHostels.length / itemsPerPage);
  const paginatedHostels = filteredHostels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = async (updatedHostel) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/hostel/${updatedHostel._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHostel),
      });
      const data = await res.json();
      if (data.success) {
        setHostels(hostels.map(h => h._id === updatedHostel._id ? data.data : h));
        setEditModal({ isOpen: false, hostel: null });
      }
    } catch (error) {
      console.error('Failed to update hostel:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/hostel/${deleteModal.hostel._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setHostels(hostels.filter(h => h._id !== deleteModal.hostel._id));
        setDeleteModal({ isOpen: false, hostel: null });
      }
    } catch (error) {
      console.error('Failed to delete hostel:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-2xl sm:text-3xl">🏢</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hostel Management</h1>
        </div>
        {isAdmin && (
          <Link href="/dashboard/add-hostel">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base">
              + Add Hostel
            </button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm md:text-base"
        >
          <option value="">All Campuses</option>
          {campuses.map((campus, idx) => (
            <option key={idx} value={campus}>{campus}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
        />

        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm md:text-base"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Table - Hidden on mobile, shown on md and above */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Campus Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hostel Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Block</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Floor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHostels.length > 0 ? (
                paginatedHostels.map((hostel, idx) => (
                  <tr key={hostel._id || idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{hostel.hostelCampus}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{hostel.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{hostel.block}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{hostel.floor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{hostel.genderRestriction}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{hostel.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewModal({ isOpen: true, hostel })}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                          title="View"
                        >
                          👁️
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditModal({ isOpen: true, hostel })}
                              className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, hostel })}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No hostels found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View - Shown on mobile, hidden on md and above */}
      <div className="md:hidden space-y-4">
        {paginatedHostels.length > 0 ? (
          paginatedHostels.map((hostel, idx) => (
            <div key={hostel._id || idx} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                <h3 className="font-bold text-lg truncate">{hostel.name}</h3>
                <p className="text-blue-100 text-sm">{hostel.hostelCampus}</p>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Block</p>
                    <p className="text-sm font-medium text-gray-900">{hostel.block}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Floor</p>
                    <p className="text-sm font-medium text-gray-900">{hostel.floor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{hostel.genderRestriction}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Location</p>
                    <p className="text-sm font-medium text-gray-900">{hostel.location}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex gap-2 justify-center">
                  <button
                    onClick={() => setViewModal({ isOpen: true, hostel })}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    View
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setEditModal({ isOpen: true, hostel })}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, hostel })}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No hostels found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
          <span className="text-gray-600 text-center sm:text-left text-sm sm:text-base">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        hostel={viewModal.hostel}
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, hostel: null })}
      />

      <EditModal
        hostel={editModal.hostel}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, hostel: null })}
        onSave={handleEdit}
        isSaving={isSaving}
      />

      <DeleteModal
        hostel={deleteModal.hostel}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hostel: null })}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
