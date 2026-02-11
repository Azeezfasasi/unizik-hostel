'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Filter,
  ChevronDown,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  MoreVertical,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import axios from 'axios';

export default function ManageDonations() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [sendingReceipt, setSendingReceipt] = useState(null);

  const limit = 10;

  // Fetch donations
  const fetchDonations = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('donationType', filterType);

      const response = await axios.get(`/api/donations?${params}`);
      setDonations(response.data.donations);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/donations?stats=true');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [filterStatus, filterType]);

  const handleStatusChange = async (donationId, newStatus) => {
    setUpdatingStatus(donationId);
    try {
      await axios.patch(`/api/donations/${donationId}`, {
        status: newStatus,
      });
      fetchDonations(currentPage);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSendReceipt = async (donationId) => {
    setSendingReceipt(donationId);
    try {
      await axios.patch(`/api/donations/${donationId}`, {
        action: 'send-receipt',
      });
      fetchDonations(currentPage);
    } catch (error) {
      console.error('Error sending receipt:', error);
    } finally {
      setSendingReceipt(null);
    }
  };

  const handleViewDetails = async (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const filteredDonations = donations.filter((donation) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      donation.donorName.toLowerCase().includes(term) ||
      donation.donorEmail.toLowerCase().includes(term) ||
      donation.transactionId.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Type', 'Status'];
    const data = filteredDonations.map((d) => [
      new Date(d.createdAt).toLocaleDateString(),
      d.donorName,
      d.donorEmail,
      d.amount,
      d.currency,
      d.donationType,
      d.status,
    ]);

    const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Donations Management</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track all donations received by UNIZIK Hostel. View details, update statuses, and export data for reporting.
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    ${stats.totalDonations?.[0]?.total?.toFixed(0) || '0'}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Donors</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {stats.totalDonations?.[0]?.count || 0}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Donation Types</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {stats.byType?.length || 0}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Donation</p>
                  <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    $
                    {stats.totalDonations?.[0]?.total
                      ? (stats.totalDonations[0].total / stats.totalDonations[0].count).toFixed(0)
                      : '0'}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="building-fund">Building</option>
              <option value="scholarship">Scholarship</option>
              <option value="community-outreach">Outreach</option>
            </select>

            <button
              onClick={downloadCSV}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Donations Display */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading donations...</p>
              </div>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No donations found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Donor
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">{donation.donorName}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{donation.donorEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {donation.currency} {donation.amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded-full whitespace-nowrap">
                            {donation.donationType}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${getStatusColor(donation.status)}`}>
                            {getStatusIcon(donation.status)}
                            <span className="hidden sm:inline">{donation.status}</span>
                            <span className="sm:hidden">{donation.status.slice(0, 3)}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewDetails(donation)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium transition flex items-center gap-1"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            {donation.status !== 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(donation._id, 'confirmed')}
                                disabled={updatingStatus === donation._id}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirm
                              </button>
                            )}
                            {donation.status === 'confirmed' && !donation.receiptSent && (
                              <button
                                onClick={() => handleSendReceipt(donation._id)}
                                disabled={sendingReceipt === donation._id}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Receipt
                              </button>
                            )}
                            {donation.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(donation._id, 'cancelled')}
                                disabled={updatingStatus === donation._id}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y">
                {filteredDonations.map((donation) => (
                  <div key={donation._id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{donation.donorName}</p>
                        <p className="text-xs text-gray-500 truncate">{donation.donorEmail}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)} whitespace-nowrap`}>
                        {getStatusIcon(donation.status)}
                        {donation.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">
                          {donation.currency} {donation.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-semibold text-gray-900 truncate">{donation.donationType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Method</p>
                        <p className="font-semibold text-gray-900 truncate">{donation.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t flex-wrap">
                      <button
                        onClick={() => handleViewDetails(donation)}
                        className="flex-1 min-w-[60px] px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {donation.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(donation._id, 'confirmed')}
                          disabled={updatingStatus === donation._id}
                          className="flex-1 min-w-[60px] px-2 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                      )}
                      {donation.status === 'confirmed' && !donation.receiptSent && (
                        <button
                          onClick={() => handleSendReceipt(donation._id)}
                          disabled={sendingReceipt === donation._id}
                          className="flex-1 min-w-[60px] px-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      )}
                      {donation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(donation._id, 'cancelled')}
                          disabled={updatingStatus === donation._id}
                          className="flex-1 min-w-[60px] px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium transition disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {filteredDonations.length > 0 ? 1 : 0} to {filteredDonations.length} of{' '}
                  {filteredDonations.length}
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => fetchDonations(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchDonations(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Donation Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Donor Name</p>
                  <p className="font-semibold text-gray-900">{selectedDonation.donorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedDonation.donorEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDonation.donorPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDonation.currency} {selectedDonation.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Donation Type</p>
                  <p className="font-semibold text-gray-900">{selectedDonation.donationType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedDonation.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-gray-900">{selectedDonation.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDonation.status)}`}>
                    {getStatusIcon(selectedDonation.status)}
                    {selectedDonation.status}
                  </div>
                </div>
              </div>

              {selectedDonation.donorMessage && (
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-gray-900">{selectedDonation.donorMessage}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedDonation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
