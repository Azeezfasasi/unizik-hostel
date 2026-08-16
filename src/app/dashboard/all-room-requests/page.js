'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notify } from '@/components/dashboard-component/ui/toast';
import ConfirmModal from '@/components/dashboard-component/ui/ConfirmModal';
import Pagination from '@/components/dashboard-component/ui/Pagination';
import PageHeader from '@/components/dashboard-component/ui/PageHeader';
import StatusBadge from '@/components/dashboard-component/ui/StatusBadge';
import EmptyState from '@/components/dashboard-component/ui/EmptyState';
import { PageSpinner, TableSkeleton } from '@/components/dashboard-component/ui/Skeleton';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Search,
  Eye,
  Check,
  X,
  MapPin,
  Mail,
  BedDouble,
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function AllRoomRequestsPage() {
  const { isAuthenticated, loading: authLoading, token, isAdmin, isStaff } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, request: null });

  // Redirect if not authenticated or not admin/staff
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !(isAdmin || isStaff))) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, isAdmin, isStaff, router]);

  // Fetch all room requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || !(isAdmin || isStaff)) return;
      try {
        setLoading(true);
        const response = await fetch('/api/room/requests', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();

        if (data.success) {
          setRequests(data.data || []);
        } else {
          notify.error(data.message || 'Failed to load room requests');
        }
      } catch (err) {
        notify.error('Error loading requests: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated, isAdmin, isStaff, token]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student?.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Reset to page 1 whenever the filtered set changes shape
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Room capacity/occupancy is already populated on request.room by GET /api/room/requests
  // (the controller does a full, unfiltered `.populate('room', ...)`, so capacity and
  // currentOccupancy come along for free — no extra /api/room fetch is needed here).
  const getRoomOccupancy = (room) => {
    if (!room) return null;
    const capacity = typeof room.capacity === 'number' ? room.capacity : null;
    const occupancy =
      typeof room.currentOccupancy === 'number'
        ? room.currentOccupancy
        : room.assignedStudents?.filter(Boolean).length ?? null;
    if (capacity === null || occupancy === null) return null;
    return { capacity, occupancy, isFull: occupancy >= capacity };
  };

  // Handle approve
  const doApprove = async (requestId) => {
    try {
      setActionLoading(requestId);

      const response = await fetch(`/api/room/requests/${requestId}?action=approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Room request approved successfully!');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'approved' } : r))
        );
        setSelectedRequest(null);
      } else {
        notify.error(data.message || 'Failed to approve request');
      }
    } catch (err) {
      notify.error('Error approving request: ' + err.message);
    } finally {
      setActionLoading(null);
      setConfirmState({ isOpen: false, type: null, request: null });
    }
  };

  // Handle decline
  const doDecline = async (requestId) => {
    try {
      setActionLoading(requestId);

      const response = await fetch(`/api/room/requests/${requestId}?action=decline`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Room request declined.');
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'declined' } : r))
        );
        setSelectedRequest(null);
      } else {
        notify.error(data.message || 'Failed to decline request');
      }
    } catch (err) {
      notify.error('Error declining request: ' + err.message);
    } finally {
      setActionLoading(null);
      setConfirmState({ isOpen: false, type: null, request: null });
    }
  };

  const openApproveConfirm = (request) =>
    setConfirmState({ isOpen: true, type: 'approve', request });
  const openDeclineConfirm = (request) =>
    setConfirmState({ isOpen: true, type: 'decline', request });
  const closeConfirm = () => {
    if (actionLoading) return;
    setConfirmState({ isOpen: false, type: null, request: null });
  };

  // Count by status
  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };

  if (authLoading) {
    return <PageSpinner label="Loading..." />;
  }

  if (!isAuthenticated || !(isAdmin || isStaff)) {
    return null;
  }

  const confirmRequest = confirmState.request;
  const confirmRoomInfo = confirmRequest ? getRoomOccupancy(confirmRequest.room) : null;

  return (
    <div className="space-y-6 mt-4 md:mt-8">
      <PageHeader
        icon={Building2}
        title="Room Requests Management"
        subtitle="Review and manage all student room requests"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: statusCounts.all, icon: Users },
          { label: 'Pending', value: statusCounts.pending, icon: Clock },
          { label: 'Approved', value: statusCounts.approved, icon: CheckCircle },
          { label: 'Declined', value: statusCounts.declined, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-900/5 text-blue-900 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, matric number, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'declined'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No room requests found"
          message="Try adjusting your search or status filter."
        />
      ) : (
        <>
          {/* Requests Table - Desktop View */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3.5 text-left">Student</th>
                    <th className="px-6 py-3.5 text-left">Email</th>
                    <th className="px-6 py-3.5 text-left">Room</th>
                    <th className="px-6 py-3.5 text-left">Bed</th>
                    <th className="px-6 py-3.5 text-left">Room Occupancy</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-left">Date</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRequests.map((request) => {
                    const roomInfo = getRoomOccupancy(request.room);
                    return (
                      <tr key={request._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {request.student?.firstName} {request.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{request.student?.matricNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm">{request.student?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {request.room?.roomNumber} ({request.room?.roomBlock})
                          </p>
                          <p className="text-xs text-gray-500">{request.room?.hostelId?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Bed {request.bed + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {roomInfo ? (
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                                roomInfo.isFull
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <BedDouble className="w-3.5 h-3.5" />
                              {roomInfo.occupancy}/{roomInfo.capacity} beds
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-500 text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openApproveConfirm(request)}
                                  disabled={actionLoading === request._id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white text-xs font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                                >
                                  {actionLoading === request._id ? (
                                    <Loader className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => openDeclineConfirm(request)}
                                  disabled={actionLoading === request._id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                                >
                                  {actionLoading === request._id ? (
                                    <Loader className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                  Decline
                                </button>
                              </>
                            )}
                            {request.status !== 'pending' && (
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requests Cards - Mobile View */}
          <div className="md:hidden space-y-4">
            {paginatedRequests.map((request) => {
              const roomInfo = getRoomOccupancy(request.room);
              return (
                <div
                  key={request._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.student?.firstName} {request.student?.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{request.student?.matricNumber}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-blue-900" />
                      {request.student?.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Room</p>
                      <p className="font-semibold text-gray-900">{request.room?.roomNumber}</p>
                      <p className="text-xs text-gray-500">{request.room?.roomBlock}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Bed</p>
                      <p className="font-semibold text-gray-900 text-lg">Bed {request.bed + 1}</p>
                    </div>
                  </div>

                  {roomInfo && (
                    <div
                      className={`rounded-lg p-3 flex items-center gap-2 text-sm ${
                        roomInfo.isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                      {roomInfo.occupancy}/{roomInfo.capacity} beds occupied
                      {roomInfo.isFull && <span className="font-semibold">— Room full</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{request.room?.hostelId?.name}</span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openApproveConfirm(request)}
                        disabled={actionLoading === request._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                      >
                        {actionLoading === request._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => openDeclineConfirm(request)}
                        disabled={actionLoading === request._id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
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
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRequests.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 border border-gray-100 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">
                    {selectedRequest.student?.firstName} {selectedRequest.student?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Matric Number</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.student?.matricNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.student?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.student?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.student?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.student?.level || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Room Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Hostel</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.room?.hostelId?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Room Number</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.room?.roomNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Block</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.room?.roomBlock}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Floor</p>
                  <p className="text-gray-900 font-medium">{selectedRequest.room?.roomFloor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Selected Bed</p>
                  <p className="text-gray-900 font-medium">Bed {selectedRequest.bed + 1}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
              {(() => {
                const roomInfo = getRoomOccupancy(selectedRequest.room);
                if (!roomInfo) return null;
                return (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      roomInfo.isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                    {roomInfo.occupancy}/{roomInfo.capacity} beds occupied
                    {roomInfo.isFull && <span>— Room is currently full</span>}
                  </div>
                );
              })()}
            </div>

            {/* Request Date */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Request Date</p>
              <p className="text-gray-900 font-medium">
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

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Approve/Decline Confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'approve' ? 'Approve room request?' : 'Decline room request?'}
        message={
          confirmRequest
            ? confirmState.type === 'approve'
              ? `Approve ${confirmRequest.student?.firstName} ${confirmRequest.student?.lastName}'s request for Room ${confirmRequest.room?.roomNumber}, Bed ${confirmRequest.bed + 1}? This will immediately assign them to the room.${
                  confirmRoomInfo
                    ? ` This room currently has ${confirmRoomInfo.occupancy}/${confirmRoomInfo.capacity} beds occupied.${confirmRoomInfo.isFull ? ' Warning: the room is already full.' : ''}`
                    : ''
                }`
              : `Decline ${confirmRequest.student?.firstName} ${confirmRequest.student?.lastName}'s request for Room ${confirmRequest.room?.roomNumber}, Bed ${confirmRequest.bed + 1}? This action cannot be undone.`
            : ''
        }
        confirmLabel={confirmState.type === 'approve' ? 'Approve' : 'Decline'}
        cancelLabel="Cancel"
        tone={confirmState.type === 'approve' ? 'primary' : 'danger'}
        isLoading={!!actionLoading}
        onConfirm={() => {
          if (!confirmRequest) return;
          if (confirmState.type === 'approve') {
            doApprove(confirmRequest._id);
          } else {
            doDecline(confirmRequest._id);
          }
        }}
        onClose={closeConfirm}
      />
    </div>
  );
}
