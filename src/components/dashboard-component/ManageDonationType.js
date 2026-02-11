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
  'Heart',
  'DollarSign',
  'Gift',
  'Building2',
  'BookOpen',
  'Handshake',
  'Lightbulb',
  'Globe',
  'Users',
  'Home',
  'Stethoscope',
  'Leaf',
  'Music',
  'Trophy',
  'Star',
  'Smile',
];

export default function ManageDonationType() {
  const [donationTypes, setDonationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    description: '',
    icon: 'Heart',
    order: 0,
  });

  // Fetch all donation types
  const fetchDonationTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donation-types?includeInactive=true');
      setDonationTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching donation types:', error);
      showMessage('Failed to fetch donation types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationTypes();
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
      icon: 'Heart',
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (type) => {
    setFormData({
      value: type.value,
      label: type.label,
      description: type.description || '',
      icon: type.icon || 'Heart',
      order: type.order || 0,
    });
    setEditingId(type._id);
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
        // Update existing type
        const response = await axios.put(`/api/donation-types?id=${editingId}`, formData);
        showMessage('Donation type updated successfully', 'success');
      } else {
        // Create new type
        const response = await axios.post('/api/donation-types', formData);
        showMessage('Donation type created successfully', 'success');
      }

      resetForm();
      fetchDonationTypes();
    } catch (error) {
      console.error('Error saving donation type:', error);
      showMessage(
        error.response?.data?.error || 'Failed to save donation type',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation type?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/donation-types?id=${id}`);
      showMessage('Donation type deleted successfully', 'success');
      fetchDonationTypes();
    } catch (error) {
      console.error('Error deleting donation type:', error);
      showMessage('Failed to delete donation type', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await axios.put(`/api/donation-types?id=${id}&toggleStatus=true`);
      showMessage('Donation type status updated', 'success');
      fetchDonationTypes();
    } catch (error) {
      console.error('Error toggling status:', error);
      showMessage('Failed to update donation type status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
      // Auto-generate value from label if creating new type
      ...(name === 'label' && !editingId && {
        value: value.toLowerCase().replace(/\s+/g, '-'),
      }),
    }));
  };

  return (
    <div className="w-full mt-[30px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Donation Types</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Add Type
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
            {editingId ? 'Edit Donation Type' : 'Add New Donation Type'}
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
                  placeholder="e.g., General Fund"
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
                  placeholder="e.g., general-fund"
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
                placeholder="Describe this donation type..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Icon and Order Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
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
                    ? 'Update Type'
                    : 'Create Type'}
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

      {/* Donation Types List */}
      {loading && !showForm ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : donationTypes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No donation types found</p>
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
                    Identifier
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
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
                {donationTypes
                  .sort((a, b) => a.order - b.order)
                  .map((type) => (
                    <tr
                      key={type._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {type.order}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {type.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {type.value}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {type.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleToggleStatus(type._id)}
                          disabled={loading}
                          className="flex items-center gap-1 text-sm"
                        >
                          {type.isActive ? (
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
                            onClick={() => handleEditClick(type)}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:text-gray-400"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(type._id)}
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
            {donationTypes
              .sort((a, b) => a.order - b.order)
              .map((type) => (
                <div
                  key={type._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {type.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {type.value}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                      #{type.order}
                    </span>
                  </div>

                  {type.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {type.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(type._id)}
                      disabled={loading}
                      className={`flex-1 py-2 rounded text-xs font-medium transition ${
                        type.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEditClick(type)}
                      disabled={loading}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(type._id)}
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
