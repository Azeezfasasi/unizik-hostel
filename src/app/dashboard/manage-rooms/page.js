'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCampus } from '@/context/CampusContext';

// Modal Components
function ViewModal({ room, isOpen, onClose }) {
  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'under-maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const occupancyPercentage = room?.capacity ? Math.round((room.currentOccupancy / room.capacity) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold">Room Details</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-blue-700 p-2 rounded-full transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Hostel Info */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-600 font-medium">HOSTEL</p>
            <p className="text-sm sm:text-base font-semibold text-gray-800">{room?.hostelId?.name || 'N/A'}</p>
          </div>

          {/* Room Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-600 font-medium">ROOM NUMBER</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{room?.roomNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-600 font-medium">BLOCK</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{room?.roomBlock}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-600 font-medium">FLOOR</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{room?.roomFloor}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs text-gray-600 font-medium">PRICE</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">₦{room?.price?.toLocaleString()}</p>
            </div>
          </div>

          {/* Capacity & Occupancy */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">Capacity: {room?.capacity} beds</p>
              <p className="text-sm font-medium text-gray-700">{occupancyPercentage}% Occupied</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">{room?.currentOccupancy} of {room?.capacity} beds occupied</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-600 font-medium mb-2">STATUS</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(room?.status)}`}>
              {room?.status?.replaceAll('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Facilities */}
          {room?.facilities && room.facilities.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">FACILITIES</p>
              <div className="flex flex-wrap gap-2">
                {room.facilities.map((facility, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ room, isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(room || {});

  useEffect(() => {
    setFormData(room || {});
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'currentOccupancy' || name === 'price' ? parseInt(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold">Edit Room</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-amber-600 p-2 rounded-full transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Block</label>
              <input
                type="text"
                name="roomBlock"
                value={formData.roomBlock || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="text"
                name="roomFloor"
                value={formData.roomFloor || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status || 'available'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="under-maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Current Occupancy</label>
              <input
                type="number"
                name="currentOccupancy"
                value={formData.currentOccupancy || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              onClick={() => onSave(formData)}
              disabled={isSaving}
              className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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

function DeleteModal({ room, isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-red-600 text-white p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold pr-8">Delete Room</h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-red-700 p-2 rounded-full transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Are you sure you want to delete <strong>Room {room?.roomNumber}</strong> in{' '}
            <strong>{room?.hostelId?.name}</strong>? This action cannot be undone.
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
export default function ManageRoomsPage() {
  const { token, isAdmin } = useAuth();
  const { hostels, loading: hostelsLoading } = useCampus();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch rooms only
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const roomsRes = await fetch('/api/room', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        const roomsData = await roomsRes.json();

        if (roomsRes.ok) setRooms(roomsData.data || []);
      } catch (err) {
        setError('Failed to fetch rooms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRooms();
  }, [token]);

  // Filter rooms
  useEffect(() => {
    let filtered = rooms;

    if (selectedHostel !== 'all') {
      filtered = filtered.filter(room => room.hostelId?._id === selectedHostel);
    }

    if (selectedBlock !== 'all') {
      filtered = filtered.filter(room => room.roomBlock === selectedBlock);
    }

    if (selectedFloor !== 'all') {
      filtered = filtered.filter(room => room.roomFloor === selectedFloor);
    }

    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [rooms, selectedHostel, selectedBlock, selectedFloor]);

  // Get unique blocks and floors
  const blocks = [...new Set(rooms.map(r => r.roomBlock))];
  const floors = [...new Set(rooms.map(r => r.roomFloor))];

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  // Actions
  const handleView = (room) => {
    setViewModal({ isOpen: true, data: room });
  };

  const handleEdit = (room) => {
    setEditModal({ isOpen: true, data: room });
  };

  const handleDelete = (room) => {
    setDeleteModal({ isOpen: true, data: room });
  };

  const handleSaveEdit = async (updatedRoom) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/room/${editModal.data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedRoom)
      });

      if (response.ok) {
        setRooms(rooms.map(r => (r._id === editModal.data._id ? updatedRoom : r)));
        setEditModal({ isOpen: false, data: null });
      } else {
        alert('Failed to update room');
      }
    } catch (err) {
      alert('Error updating room');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/room/${deleteModal.data._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setRooms(rooms.filter(r => r._id !== deleteModal.data._id));
        setDeleteModal({ isOpen: false, data: null });
      } else {
        alert('Failed to delete room');
      }
    } catch (err) {
      alert('Error deleting room');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to manage rooms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              🏠 Room Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Manage all rooms across hostels</p>
          </div>
          <a
            href="/dashboard/add-room"
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base text-center"
          >
            + Add Room
          </a>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-red-700 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8">
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="all">All Hostels</option>
            {hostels.map(hostel => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="all">All Blocks</option>
            {blocks.map(block => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="all">All Floors</option>
            {floors.map(floor => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Table - Desktop View */}
        {!loading && (
          <>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Campus</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Hostel</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Block</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Floor</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Room Number</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Occupancy</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-xs sm:text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRooms.map(room => (
                    <tr key={room._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{room.hostelId?.hostelCampus}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{room.hostelId?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{room.roomBlock}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{room.roomFloor}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{room.roomNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{room.capacity}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{room.currentOccupancy}/{room.capacity}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">₦{room.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleView(room)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                          >
                            👁
                          </button>
                          <button
                            onClick={() => handleEdit(room)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile View */}
            <div className="md:hidden space-y-4 mb-6">
              {paginatedRooms.map(room => (
                <div key={room._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                    <h3 className="font-bold text-lg">{room.hostelId?.name}</h3>
                    <p className="text-blue-100 text-sm">Room {room.roomNumber}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">BLOCK</p>
                        <p className="text-sm font-bold text-gray-800">{room.roomBlock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">FLOOR</p>
                        <p className="text-sm font-bold text-gray-800">{room.roomFloor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">CAPACITY</p>
                        <p className="text-sm font-bold text-gray-800">{room.capacity} beds</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">OCCUPANCY</p>
                        <p className="text-sm font-bold text-gray-800">{room.currentOccupancy}/{room.capacity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">PRICE</p>
                        <p className="text-sm font-bold text-gray-800">₦{room.price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">STATUS</p>
                        <p className={`text-xs font-bold ${
                          room.status === 'available' ? 'text-green-600' :
                          room.status === 'occupied' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {room.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleView(room)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(room)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {paginatedRooms.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-base sm:text-lg">No rooms found matching your filters</p>
              </div>
            )}

            {/* Pagination */}
            {filteredRooms.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <label>Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>of {filteredRooms.length}</span>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ViewModal room={viewModal.data} isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, data: null })} />
      <EditModal
        room={editModal.data}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
      <DeleteModal
        room={deleteModal.data}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, data: null })}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
