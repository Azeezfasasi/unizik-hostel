'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const LUCIDE_ICONS = [
  'CreditCard',
  'DollarSign',
  'Banknote',
  'Building2',
  'Smartphone',
  'Globe',
  'Send',
  'CheckSquare',
  'Hand',
  'Wallet',
  'MoneyTransfer',
  'Copy',
  'Shield',
  'Zap',
  'TrendingUp',
  'Key',
];

const CATEGORIES = ['bank', 'digital', 'check', 'cash', 'other'];
const CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'NGN'];

export default function ManagePaymentMethod() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    description: '',
    icon: 'CreditCard',
    category: 'other',
    order: 0,
    requiresReference: false,
    minAmount: null,
    maxAmount: null,
    supportedCurrencies: ['USD', 'CAD', 'EUR', 'GBP', 'NGN'],
    processingTime: 'Instant',
    fees: 0,
  });

  // Fetch all payment methods
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payment-methods?includeInactive=true');
      setPaymentMethods(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      showMessage('Failed to fetch payment methods', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const resetForm = () => {
    setFormData({
      value: '',
      label: '',
      description: '',
      icon: 'CreditCard',
      category: 'other',
      order: 0,
      requiresReference: false,
      minAmount: null,
      maxAmount: null,
      supportedCurrencies: ['USD', 'CAD', 'EUR', 'GBP', 'NGN'],
      processingTime: 'Instant',
      fees: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (method) => {
    setFormData({
      value: method.value,
      label: method.label,
      description: method.description || '',
      icon: method.icon || 'CreditCard',
      category: method.category || 'other',
      order: method.order || 0,
      requiresReference: method.requiresReference || false,
      minAmount: method.minAmount || null,
      maxAmount: method.maxAmount || null,
      supportedCurrencies: method.supportedCurrencies || CURRENCIES,
      processingTime: method.processingTime || 'Instant',
      fees: method.fees || 0,
    });
    setEditingId(method._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label || !formData.value) {
      showMessage('Label and value are required', 'error');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing method
        await axios.put(`/api/payment-methods?id=${editingId}`, formData);
        showMessage('Payment method updated successfully', 'success');
      } else {
        // Create new method
        await axios.post('/api/payment-methods', formData);
        showMessage('Payment method created successfully', 'success');
      }

      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      showMessage(
        error.response?.data?.error || 'Failed to save payment method',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/payment-methods?id=${id}`);
      showMessage('Payment method deleted successfully', 'success');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      showMessage('Failed to delete payment method', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await axios.put(`/api/payment-methods?id=${id}&toggleStatus=true`);
      showMessage('Payment method status updated', 'success');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling status:', error);
      showMessage('Failed to update payment method status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? null
              : parseFloat(value)
            : value,
      // Auto-generate value from label if creating new method
      ...(name === 'label' && !editingId && {
        value: value.toLowerCase().replace(/\s+/g, '-'),
      }),
    }));
  };

  const handleCurrencyToggle = (currency) => {
    setFormData((prev) => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.includes(currency)
        ? prev.supportedCurrencies.filter((c) => c !== currency)
        : [...prev.supportedCurrencies, currency],
    }));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Add Method
          </button>
        )}
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {messageType === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
              {/* Label Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="e.g., Bank Transfer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Value Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identifier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g., bank-transfer"
                  disabled={!!editingId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingId ? 'Cannot be changed' : 'Auto-generated from label'}
                </p>
              </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this payment method..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Icon, Category, and Order Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LUCIDE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Processing and Fees Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Processing Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Time
                </label>
                <input
                  type="text"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleInputChange}
                  placeholder="e.g., 1-3 business days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Requires Reference */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresReference"
                    checked={formData.requiresReference}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Requires Reference
                  </span>
                </label>
              </div>
            </div>

            {/* Amount Limits Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (optional)
                </label>
                <input
                  type="number"
                  name="minAmount"
                  value={formData.minAmount || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Leave blank for no limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Amount (optional)
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  value={formData.maxAmount || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Leave blank for no limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Supported Currencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supported Currencies
              </label>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => handleCurrencyToggle(currency)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      formData.supportedCurrencies.includes(currency)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
              >
                {loading
                  ? 'Saving...'
                  : editingId
                    ? 'Update Method'
                    : 'Create Method'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Methods List */}
      {loading && !showForm ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No payment methods found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Processing Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods
                  .sort((a, b) => a.order - b.order)
                  .map((method) => (
                    <tr
                      key={method._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {method.order}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {method.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {method.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {method.processingTime}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {method.fees}%
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleToggleStatus(method._id)}
                          disabled={loading}
                          className="flex items-center gap-1 text-sm"
                        >
                          {method.isActive ? (
                            <span className="flex items-center gap-1 text-green-600 hover:text-green-700">
                              <Eye size={16} />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 hover:text-gray-500">
                              <EyeOff size={16} />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditClick(method)}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:text-gray-400"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(method._id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:text-gray-400"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {paymentMethods
              .sort((a, b) => a.order - b.order)
              .map((method) => (
                <div
                  key={method._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {method.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {method.category} • {method.processingTime}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                      #{method.order}
                    </span>
                  </div>

                  {method.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {method.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-600 mb-3">
                    Fee: {method.fees}% | Ref: {method.requiresReference ? 'Yes' : 'No'}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(method._id)}
                      disabled={loading}
                      className={`flex-1 py-2 rounded text-xs font-medium transition ${
                        method.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {method.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEditClick(method)}
                      disabled={loading}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(method._id)}
                      disabled={loading}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
