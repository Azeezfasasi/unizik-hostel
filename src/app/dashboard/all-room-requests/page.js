'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Search,
  Filter,
  Eye,
  Check,
  X,
  MapPin,
  User,
  Mail,
  Hash,
} from 'lucide-react';

export default function AllRoomRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all room requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/room/requests');
        const data = await response.json();

        if (data.success) {
          setRequests(data.data || []);
        } else {
          setError('Failed to load room requests');
        }
      } catch (err) {
        setError('Error loading requests: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-100 border-yellow-500';
      case 'approved':
        return 'bg-green-900 text-green-100 border-green-500';
      case 'declined':
        return 'bg-red-900 text-red-100 border-red-500';
      default:
        return 'bg-gray-700 text-gray-100 border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Handle approve
  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');

      const response = await fetch(`/api/room/requests/${requestId}?action=approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Room request approved successfully!');
        // Update the request in state
        setRequests(
          requests.map((r) =>
            r._id === requestId ? { ...r, status: 'approved' } : r
          )
        );
        setSelectedRequest(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to approve request');
      }
    } catch (err) {
      setError('Error approving request: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle decline
  const handleDecline = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');

      const response = await fetch(`/api/room/requests/${requestId}?action=decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Room request declined successfully!');
        // Update the request in state
        setRequests(
          requests.map((r) =>
            r._id === requestId ? { ...r, status: 'declined' } : r
          )
        );
        setSelectedRequest(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to decline request');
      }
    } catch (err) {
      setError('Error declining request: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Count by status
  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-400" />
            Room Requests Management
          </h1>
          <p className="text-gray-300">Review and manage all student room requests</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-900 border border-green-500 rounded-lg p-4 flex items-start gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-100">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: statusCounts.all, color: 'from-purple-600 to-purple-700', icon: Users },
            { label: 'Pending', value: statusCounts.pending, color: 'from-yellow-600 to-yellow-700', icon: Clock },
            { label: 'Approved', value: statusCounts.approved, color: 'from-green-600 to-green-700', icon: CheckCircle },
            { label: 'Declined', value: statusCounts.declined, color: 'from-red-600 to-red-700', icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-lg p-4 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 text-sm font-medium">{label}</p>
                  <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <Icon className="w-8 h-8 text-white opacity-30" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, matric number, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-purple-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'declined'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-gray-300">Loading room requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">No room requests found</p>
          </div>
        ) : (
          <>
            {/* Requests Table - Desktop View */}
            <div className="hidden md:block bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Room</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Bed</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, idx) => (
                      <tr
                        key={request._id}
                        className={`border-b border-slate-700 hover:bg-slate-700/50 transition ${
                          idx % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">
                              {request.student?.firstName} {request.student?.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{request.student?.matricNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300 text-sm">{request.student?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">
                            {request.room?.roomNumber} ({request.room?.roomBlock})
                          </p>
                          <p className="text-xs text-gray-400">{request.room?.hostelId?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                            Bed {request.bed + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400 text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request._id)}
                                  disabled={actionLoading === request._id}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                  {actionLoading === request._id ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecline(request._id)}
                                  disabled={actionLoading === request._id}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50"
                                >
                                  {actionLoading === request._id ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                  Decline
                                </button>
                              </>
                            )}
                            {request.status !== 'pending' && (
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-semibold text-sm transition flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Requests Cards - Mobile View */}
            <div className="md:hidden space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white">
                        {request.student?.firstName} {request.student?.lastName}
                      </h3>
                      <p className="text-xs text-gray-400">{request.student?.matricNumber}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-slate-700 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-purple-400" />
                      {request.student?.email}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Room</p>
                      <p className="font-semibold text-white">{request.room?.roomNumber}</p>
                      <p className="text-xs text-gray-400">{request.room?.roomBlock}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Bed</p>
                      <p className="font-semibold text-white text-lg">Bed {request.bed + 1}</p>
                    </div>
                  </div>

                  {/* Hostel and Date */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{request.room?.hostelId?.name}</span>
                    </div>
                    <span className="text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-600">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={actionLoading === request._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === request._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(request._id)}
                        disabled={actionLoading === request._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === request._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          >
            <div
              className="bg-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-6 border border-purple-500 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-white font-semibold">
                      {selectedRequest.student?.firstName} {selectedRequest.student?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Matric Number</p>
                    <p className="text-white font-semibold">{selectedRequest.student?.matricNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-white font-semibold">{selectedRequest.student?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-white font-semibold">{selectedRequest.student?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-white font-semibold">{selectedRequest.student?.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Level</p>
                    <p className="text-white font-semibold">{selectedRequest.student?.level}</p>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white">Room Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Hostel</p>
                    <p className="text-white font-semibold">{selectedRequest.room?.hostelId?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Room Number</p>
                    <p className="text-white font-semibold">{selectedRequest.room?.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Block</p>
                    <p className="text-white font-semibold">{selectedRequest.room?.roomBlock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Floor</p>
                    <p className="text-white font-semibold">{selectedRequest.room?.roomFloor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Selected Bed</p>
                    <p className="text-white font-semibold">Bed {selectedRequest.bed + 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        selectedRequest.status
                      )}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Date */}
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-xs text-gray-400">Request Date</p>
                <p className="text-white font-semibold">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
