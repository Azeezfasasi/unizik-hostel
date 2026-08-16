'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Eye, Edit2, Trash2, X, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notify } from '@/components/dashboard-component/ui/toast';
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal';
import Pagination from '@/components/dashboard-component/ui/Pagination';
import PageHeader from '@/components/dashboard-component/ui/PageHeader';
import EmptyState from '@/components/dashboard-component/ui/EmptyState';
import { PageSpinner } from '@/components/dashboard-component/ui/Skeleton';

// Modal Components
function ViewModal({ hostel, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white p-4 sm:p-6 sticky top-0">
          <h2 className="text-xl sm:text-2xl font-bold pr-8 break-words">{hostel?.name}</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-white/10 p-2 rounded-full transition"
          >
            <X size={20} />
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
            className="w-full mt-4 sm:mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white p-4 sm:p-6 sticky top-0">
          <h2 className="text-xl sm:text-2xl font-bold pr-8">Edit Hostel</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-white/10 p-2 rounded-full transition"
          >
            <X size={20} />
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm">Gender Restriction</label>
              <select
                name="genderRestriction"
                value={formData.genderRestriction || 'mixed'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
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
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
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
        notify.success('Hostel updated successfully');
      } else {
        notify.error(data.message || 'Failed to update hostel');
      }
    } catch (error) {
      console.error('Failed to update hostel:', error);
      notify.error('Failed to update hostel');
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
        notify.success('Hostel deleted successfully');
      } else {
        notify.error(data.message || 'Failed to delete hostel');
      }
    } catch (error) {
      console.error('Failed to delete hostel:', error);
      notify.error('Failed to delete hostel');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <PageSpinner label="Loading hostels..." />;
  }

  return (
    <div className="space-y-6 mt-8">
      <PageHeader
        icon={Building2}
        title="Hostel Management"
        subtitle="Manage hostels across all campuses"
        actions={
          isAdmin && (
            <Link href="/dashboard/add-hostel">
              <button className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
                <Plus size={16} />
                Add Hostel
              </button>
            </Link>
          )
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
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
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
        />

        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition bg-white"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Table - Hidden on mobile, shown on md and above */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Campus Name</th>
                <th className="px-4 py-3 text-left">Hostel Name</th>
                <th className="px-4 py-3 text-left">Block</th>
                <th className="px-4 py-3 text-left">Floor</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedHostels.length > 0 ? (
                paginatedHostels.map((hostel, idx) => (
                  <tr key={hostel._id || idx} className="hover:bg-gray-50/60 transition">
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
                          className="inline-flex items-center justify-center p-2 rounded-lg text-blue-900 bg-blue-900/5 hover:bg-blue-900/10 transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditModal({ isOpen: true, hostel })}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, hostel })}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
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
            <div key={hostel._id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-900 text-white p-4">
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

                <div className="pt-3 border-t border-gray-100 flex gap-2 justify-center">
                  <button
                    onClick={() => setViewModal({ isOpen: true, hostel })}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                  >
                    View
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setEditModal({ isOpen: true, hostel })}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, hostel })}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
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
          <EmptyState icon={Building2} title="No hostels found" message="Try adjusting your filters or search." />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredHostels.length}
        pageSize={itemsPerPage}
      />

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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Hostel"
        message={deleteModal.hostel ? `Are you sure you want to delete "${deleteModal.hostel.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, hostel: null })}
      />
    </div>
  );
}
