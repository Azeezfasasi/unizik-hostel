'use client';

import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

export default function DonationForm() {
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    currency: 'USD',
    donationType: 'general',
    paymentMethod: 'bank-transfer',
    referenceNumber: '',
    donorMessage: '',
  });

  const [bankDetails, setBankDetails] = useState(null);
  const [donationTypes, setDonationTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Fetch bank details, donation types, and payment methods on mount
  useEffect(() => {
    fetchBankDetails();
    fetchDonationTypes();
    fetchPaymentMethods();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setBankLoading(true);
      const response = await axios.get('/api/bank-details');
      setBankDetails(response.data);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      // Use default values if fetch fails
      setBankDetails({
        bankName: 'Bank Details Not Available',
        accountName: 'Please contact administrator',
        accountNumber: '****',
        routingNumber: '****',
        swiftCode: 'N/A',
        address: '',
        phone: '',
        email: '',
        website: '',
      });
    } finally {
      setBankLoading(false);
    }
  };

  const fetchDonationTypes = async () => {
    try {
      setTypesLoading(true);
      const response = await axios.get('/api/donation-types');
      const activeTypes = Array.isArray(response.data) 
        ? response.data.filter(type => type.isActive)
        : [];
      setDonationTypes(activeTypes);
      
      // Set default donation type to first available type or 'general'
      if (activeTypes.length > 0) {
        setFormData(prev => ({
          ...prev,
          donationType: activeTypes[0].value
        }));
      }
    } catch (error) {
      console.error('Error fetching donation types:', error);
      // Use fallback donation types if fetch fails
      const fallbackTypes = [
        { _id: '1', value: 'general', label: 'General Fund', icon: 'Heart', order: 0, isActive: true },
        { _id: '2', value: 'building-fund', label: 'Building Fund', icon: 'Building2', order: 1, isActive: true },
        { _id: '3', value: 'scholarship', label: 'Scholarship Program', icon: 'BookOpen', order: 2, isActive: true },
        { _id: '4', value: 'community-outreach', label: 'Community Outreach', icon: 'Handshake', order: 3, isActive: true },
        { _id: '5', value: 'other', label: 'Other', icon: 'Gift', order: 4, isActive: true },
      ];
      setDonationTypes(fallbackTypes);
      setFormData(prev => ({
        ...prev,
        donationType: 'general'
      }));
    } finally {
      setTypesLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setMethodsLoading(true);
      const response = await axios.get('/api/payment-methods');
      const activeMethods = Array.isArray(response.data)
        ? response.data.filter(method => method.isActive)
        : [];
      setPaymentMethods(activeMethods);

      // Set default payment method to first available or 'bank-transfer'
      if (activeMethods.length > 0) {
        setFormData(prev => ({
          ...prev,
          paymentMethod: activeMethods[0].value
        }));
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Use fallback payment methods if fetch fails
      const fallbackMethods = [
        { _id: '1', value: 'bank-transfer', label: 'Bank Transfer', icon: 'Banknote', order: 0, isActive: true },
        { _id: '2', value: 'check', label: 'Check', icon: 'CheckSquare', order: 1, isActive: true },
        { _id: '3', value: 'cash', label: 'Cash', icon: 'DollarSign', order: 2, isActive: true },
        { _id: '4', value: 'other', label: 'Other', icon: 'CreditCard', order: 3, isActive: true },
      ];
      setPaymentMethods(fallbackMethods);
      setFormData(prev => ({
        ...prev,
        paymentMethod: 'bank-transfer'
      }));
    } finally {
      setMethodsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const validateForm = () => {
    const { donorName, donorEmail, amount, paymentMethod } = formData;

    if (!donorName.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }

    if (!donorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid donation amount');
      return false;
    }

    if (!paymentMethod) {
      setErrorMessage('Please select a payment method');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus(null);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('/api/donations', {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (response.status === 201) {
        setSuccessMessage(
          `Thank you, ${formData.donorName}! Your donation has been received. You will receive a confirmation email shortly.`
        );
        setStatus('success');
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          amount: '',
          currency: 'USD',
          donationType: 'general',
          paymentMethod: 'bank-transfer',
          referenceNumber: '',
          donorMessage: '',
        });

        // Reset form after 5 seconds
        setTimeout(() => {
          setStatus(null);
          setSuccessMessage('');
        }, 5000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Failed to process donation. Please try again.';
      setErrorMessage(errorMsg);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const maskAccountNumber = (number) => {
    if (!number) return '****';
    return '**** ' + number.slice(-4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Support Our Mission</h1>
          <p className="text-xl text-gray-600">
            Your generous donation helps us serve our community and spread God's love
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Success Message */}
              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Success!</h3>
                    <p className="text-green-800">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                    <p className="text-red-800">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Donor Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="donorName"
                        name="donorName"
                        value={formData.donorName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="donorEmail"
                        name="donorEmail"
                        value={formData.donorEmail}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="donorPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="donorPhone"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Donation Details */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900">Donation Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="100"
                        min="1"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                        Currency <span className="text-red-500">*</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donationType" className="block text-sm font-medium text-gray-700 mb-2">
                        Donation Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="donationType"
                        name="donationType"
                        value={formData.donationType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                        disabled={typesLoading}
                      >
                        {typesLoading ? (
                          <option>Loading donation types...</option>
                        ) : donationTypes.length > 0 ? (
                          donationTypes.map((type) => (
                            <option key={type._id} value={type.value}>
                              {type.label}
                            </option>
                          ))
                        ) : (
                          <option>No donation types available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                        disabled={methodsLoading}
                      >
                        {methodsLoading ? (
                          <option>Loading payment methods...</option>
                        ) : paymentMethods.length > 0 ? (
                          paymentMethods.map((method) => (
                            <option key={method._id} value={method.value}>
                              {method.label}
                            </option>
                          ))
                        ) : (
                          <option>No payment methods available</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      placeholder="e.g., Check number or bank reference"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-4 pt-4 border-t">
                  <label htmlFor="donorMessage" className="block text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <textarea
                    id="donorMessage"
                    name="donorMessage"
                    value={formData.donorMessage}
                    onChange={handleChange}
                    placeholder="Share a message or dedication for your donation..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                {/* Success Message */}
                {status === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Success!</h3>
                      <p className="text-green-800">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                      <p className="text-red-800">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Donate Now
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Your donation is secure and encrypted
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Account Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 sticky top-20">
              {bankLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Loading bank details...</p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Bank Account Details</h3>

                  <div className="space-y-4 sm:space-y-5">
                    {bankDetails?.bankName && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Bank Name</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                          {bankDetails.bankName}
                        </p>
                      </div>
                    )}

                    {bankDetails?.accountName && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Account Holder</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                          {bankDetails.accountName}
                        </p>
                      </div>
                    )}

                    {bankDetails?.accountNumber && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Account Number</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono">
                          {showSensitiveData ? bankDetails.accountNumber : maskAccountNumber(bankDetails.accountNumber)}
                        </p>
                      </div>
                    )}

                    {bankDetails?.routingNumber && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Routing Number</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono">
                          {showSensitiveData ? bankDetails.routingNumber : '****'}
                        </p>
                      </div>
                    )}

                    {bankDetails?.swiftCode && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">SWIFT Code</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono">
                          {bankDetails.swiftCode}
                        </p>
                      </div>
                    )}

                    {bankDetails?.ibanCode && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">IBAN Code</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono">
                          {showSensitiveData ? bankDetails.ibanCode : '****'}
                        </p>
                      </div>
                    )}

                    {bankDetails?.address && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">
                          {bankDetails.address}
                        </p>
                      </div>
                    )}

                    {bankDetails?.phone && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Phone</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">
                          {bankDetails.phone}
                        </p>
                      </div>
                    )}

                    {bankDetails?.email && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">
                          {bankDetails.email}
                        </p>
                      </div>
                    )}

                    {bankDetails?.website && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Website</p>
                        <p className="text-sm sm:text-base text-gray-900 break-words">
                          {bankDetails.website}
                        </p>
                      </div>
                    )}
                  </div>

                  {(bankDetails?.accountNumber || bankDetails?.routingNumber || bankDetails?.ibanCode) && (
                    <button
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                    >
                      {showSensitiveData ? 'Hide Sensitive Data' : 'Show Full Details'}
                    </button>
                  )}

                  <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-900">
                      <strong>Need help?</strong> Contact us at {bankDetails?.email || 'donations@example.org'} or call {bankDetails?.phone || '(555) 123-4567'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow">
            <h4 className="font-semibold text-gray-900 mb-2">100% Secure</h4>
            <p className="text-gray-600 text-sm">
              Your donation information is encrypted and protected
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h4 className="font-semibold text-gray-900 mb-2">Trusted Organization</h4>
            <p className="text-gray-600 text-sm">
              CANAN USA is a verified organization committed to transparency and accountability.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h4 className="font-semibold text-gray-900 mb-2">Instant Confirmation</h4>
            <p className="text-gray-600 text-sm">
              Receive an immediate confirmation and receipt via email after your donation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
