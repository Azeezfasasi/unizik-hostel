'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';

export default function ManageBankDetails() {
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    ibanCode: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    accountType: 'business',
    currency: 'USD',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Fetch bank details on mount
  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bank-details');
      setFormData({
        bankName: response.data.bankName || '',
        accountName: response.data.accountName || '',
        accountNumber: response.data.accountNumber || '',
        routingNumber: response.data.routingNumber || '',
        swiftCode: response.data.swiftCode || '',
        ibanCode: response.data.ibanCode || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        website: response.data.website || '',
        accountType: response.data.accountType || 'business',
        currency: response.data.currency || 'USD',
        notes: response.data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setStatus('error');
      setMessage('Failed to load bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bankName.trim() || !formData.accountName.trim() || !formData.accountNumber.trim()) {
      setStatus('error');
      setMessage('Bank name, account holder name, and account number are required');
      return;
    }

    setSaving(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await axios.put('/api/bank-details', formData);

      setStatus('success');
      setMessage('Bank details updated successfully!');
      setFormData(response.data);

      setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 4000);
    } catch (error) {
      console.error('Error updating bank details:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  const maskAccountNumber = (number) => {
    if (!number) return '';
    return '**** ' + number.slice(-4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Details Management</h1>
          </div>
          <p className="text-gray-600">
            Manage and update your organization's bank account information displayed on the donation form
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Success!</h3>
              <p className="text-green-800">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-800">{message}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Bank Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b">
                Bank Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g., Bank of America"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="e.g., UNIZIK Hostel Admin."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b flex items-center justify-between">
                Account Details
                <button
                  type="button"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="flex items-center gap-1 text-sm font-normal text-blue-600 hover:text-blue-700"
                >
                  {showSensitiveData ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Show
                    </>
                  )}
                </button>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSensitiveData ? 'text' : 'password'}
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Routing Number
                  </label>
                  <input
                    type={showSensitiveData ? 'text' : 'password'}
                    id="routingNumber"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    placeholder="Enter routing number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="swiftCode" className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT Code
                  </label>
                  <input
                    type="text"
                    id="swiftCode"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    placeholder="e.g., BOAUS3N"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="ibanCode" className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN Code
                  </label>
                  <input
                    type="text"
                    id="ibanCode"
                    name="ibanCode"
                    value={formData.ibanCode}
                    onChange={handleChange}
                    placeholder="Enter IBAN"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., donations@unizikhostel.org"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, New York, NY 10001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="e.g., https://unizikhostel.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any internal notes about this account..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={fetchBankDetails}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Information</h3>
          <p className="text-blue-800 text-sm sm:text-base">
            The bank details you enter here will be automatically displayed on the public donation form. 
            Only one set of bank details can be active at a time. When you save new details, they will 
            immediately appear to donors on the donation page.
          </p>
        </div>
      </div>
    </div>
  );
}
