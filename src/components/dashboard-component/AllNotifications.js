'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Users,
  MessageSquare,
  Heart,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

export default function AllNotifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const [registrationRes, contactRes, donationsRes] = await Promise.all([
          fetch('/api/joinus?status=pending&limit=50'),
          fetch('/api/contact?status=pending&limit=50'),
          fetch('/api/donations?status=pending&limit=50'),
        ]);

        const registrationData = registrationRes.ok ? await registrationRes.json() : { data: [] };
        const contactData = contactRes.ok ? await contactRes.json() : { data: [] };
        const donationsData = donationsRes.ok ? await donationsRes.json() : { donations: [] };

        const allNotifications = [
          ...(registrationData.data || []).map(item => ({
            id: item._id,
            type: 'registration',
            title: `${item.firstName} ${item.lastName}`,
            email: item.email,
            phone: item.phone,
            message: `Registration Request`,
            timestamp: item.createdAt,
            status: item.status || 'pending',
            data: item
          })),
          ...(contactData.data || []).map(item => ({
            id: item._id,
            type: 'contact',
            title: item.name || 'Contact Form Submission',
            email: item.email,
            message: item.subject || 'New contact form submission',
            timestamp: item.createdAt,
            status: item.status || 'pending',
            data: item
          })),
          ...(donationsData.donations || []).map(item => ({
            id: item._id,
            type: 'donation',
            title: `${item.donorName}`,
            email: item.donorEmail,
            phone: item.donorPhone,
            message: `${item.donationType} - ${item.currency} ${item.amount}`,
            timestamp: item.createdAt,
            status: item.status || 'pending',
            data: item
          }))
        ];

        // Sort by timestamp, newest first
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on tab and search
  const filteredNotifications = notifications.filter(notif => {
    const matchesTab = activeTab === 'all' || notif.type === activeTab;
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'registration':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-600' };
      case 'contact':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', icon: 'text-green-600' };
      case 'donation':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800', icon: 'text-purple-600' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800', icon: 'text-gray-600' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'registration':
        return <Users className="w-5 h-5" />;
      case 'contact':
        return <MessageSquare className="w-5 h-5" />;
      case 'donation':
        return <Heart className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'registration':
        return 'Registration';
      case 'contact':
        return 'Contact';
      case 'donation':
        return 'Donation';
      default:
        return 'Notification';
    }
  };

  const getActionLink = (type) => {
    switch (type) {
      case 'registration':
        return '/dashboard/member-registration-request';
      case 'contact':
        return '/dashboard/contact-form-responses';
      case 'donation':
        return '/dashboard/donations';
      default:
        return '#';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Notifications', count: notifications.length },
    { id: 'registration', label: 'Registration Requests', count: notifications.filter(n => n.type === 'registration').length },
    { id: 'contact', label: 'Contact Forms', count: notifications.filter(n => n.type === 'contact').length },
    { id: 'donation', label: 'Donations', count: notifications.filter(n => n.type === 'donation').length },
  ];

  return (
    <div className="w-[55%] md:w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start md:items-center gap-3 md:gap-4 mb-2">
            <div className="p-2.5 md:p-3 bg-blue-600 rounded-lg flex-shrink-0">
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">All Notifications</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Manage all pending requests and submissions</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-3 md:top-3.5 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-1.5 md:p-2 overflow-x-auto">
          <div className="flex gap-1 min-w-min md:min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap text-xs md:text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`inline-flex items-center justify-center px-1.5 md:px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-sm md:text-base text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'All caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredNotifications.map(notification => {
              const colors = getTypeColor(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`bg-white border-2 ${colors.border} rounded-lg p-3 md:p-6 hover:shadow-lg transition-all duration-200`}
                >
                  {/* Header Row - Icon, Title, Badge */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2.5 md:p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <div className={`${colors.icon} w-5 h-5 md:w-6 md:h-6`}>{getTypeIcon(notification.type)}</div>
                    </div>

                    {/* Title and Badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">
                          {notification.title}
                        </h3>
                        <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="ml-14 md:ml-0 mb-3">
                    <p className="text-sm md:text-base text-gray-700 font-medium break-words">
                      {notification.message}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="ml-14 md:ml-0 space-y-2 mb-4">
                    {notification.email && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 break-all">
                        <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="break-all">{notification.email}</span>
                      </div>
                    )}
                    {notification.phone && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>{notification.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer - Date and Button */}
                  <div className="ml-14 md:ml-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      {new Date(notification.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={getActionLink(notification.type)}
                      className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-800">
              <span className="font-semibold">{filteredNotifications.length}</span> notification{filteredNotifications.length !== 1 ? 's' : ''} pending review. Click on any notification to view details and take action.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
