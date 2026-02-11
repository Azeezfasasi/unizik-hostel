'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchLeadership } from '@/app/utils/leadershipApi';
import { fetchDepartments } from '@/app/utils/departmentApi';
import { Mail, Phone, Linkedin, Twitter, Loader, Search } from 'lucide-react';

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeaders, setFilteredLeaders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [leadershipResponse, departmentsResponse] = await Promise.all([
          fetchLeadership({ limit: 100 }),
          fetchDepartments(),
        ]);
        setLeaders(leadershipResponse.leaders);
        setDepartments(departmentsResponse.departments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = leaders;

    if (selectedDept) {
      filtered = filtered.filter(leader => leader.department?._id === selectedDept);
    }

    if (searchTerm) {
      filtered = filtered.filter(leader =>
        leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leader.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaders(filtered);
  }, [leaders, selectedDept, searchTerm]);

  const groupedLeaders = filteredLeaders.reduce((acc, leader) => {
    const deptId = leader.department?._id;
    if (!acc[deptId]) {
      acc[deptId] = [];
    }
    acc[deptId].push(leader);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-green-200 to-red-200">
      {/* Header Section */}
      <div className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Leadership</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Meet the dedicated team driving our mission forward. Our leadership is committed to making a meaningful difference in our community.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 stext-slate-400" />
              <input
                type="text"
                placeholder="Search by name or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 sbg-slate-700 border border-blue-500 rounded-lg text-blue-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Department Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDept('')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedDept === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Departments
              </button>
              {departments.map(dept => (
                <button
                  key={dept._id}
                  onClick={() => setSelectedDept(dept._id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedDept === dept._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : filteredLeaders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No leadership members found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Display in departments or flat list based on filter */}
            {selectedDept === '' ? (
              departments.map(dept => (
                groupedLeaders[dept._id] && groupedLeaders[dept._id].length > 0 && (
                  <div key={dept._id}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 pb-4 border-b border-slate-700">
                      {dept.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {groupedLeaders[dept._id].map(leader => (
                        <LeaderCard key={leader._id} leader={leader} />
                      ))}
                    </div>
                  </div>
                )
              ))
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 pb-4 border-b border-slate-700">
                  {departments.find(d => d._id === selectedDept)?.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredLeaders.map(leader => (
                    <LeaderCard key={leader._id} leader={leader} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderCard({ leader }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Card */}
      <div 
        className="group relative h-full cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="absolute inset-0 bg-white rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
        <div className="relative bg-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-600 to-slate-800 overflow-hidden">
            {leader.image?.url ? (
              <Image
                src={leader.image.url}
                alt={leader.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {leader.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
          </div>

          {/* Content Section - Minimal */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{leader.name}</h3>
            <p className="text-blue-400 font-semibold text-sm sm:text-base">{leader.position}</p>
            <p className="text-slate-400 text-xs mt-4">Click to view details</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed at top */}
            <div className="bg-slate-800 p-6 border-b border-slate-600 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{leader.name}</h2>
                <p className="text-blue-400 font-semibold mt-1">{leader.position}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-600 hover:text-white transition text-4xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Image */}
              {leader.image?.url && (
                <div className="relative h-64 w-64 mx-auto">
                  <Image
                    src={leader.image.url}
                    alt={leader.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Bio */}
              {leader.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                  <p className="text-slate-300 leading-relaxed">{leader.bio}</p>
                </div>
              )}

              {/* Responsibilities */}
              {leader.responsibilities && leader.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {leader.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Contact</h3>
                <div className="space-y-3">
                  {leader.email && (
                    <a
                      href={`mailto:${leader.email}`}
                      className="flex items-center gap-3 text-slate-300 hover:text-blue-400 transition"
                    >
                      <Mail className="h-5 w-5 flex-shrink-0" />
                      <span>{leader.email}</span>
                    </a>
                  )}
                  {leader.phone && (
                    <a
                      href={`tel:${leader.phone}`}
                      className="flex items-center gap-3 text-slate-300 hover:text-blue-400 transition"
                    >
                      <Phone className="h-5 w-5 flex-shrink-0" />
                      <span>{leader.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(leader.linkedin || leader.twitter) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
                  <div className="flex gap-4">
                    {leader.linkedin && (
                      <a
                        href={leader.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-600 text-slate-300 hover:bg-blue-600 hover:text-white transition"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                    {leader.twitter && (
                      <a
                        href={leader.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-600 text-slate-300 hover:bg-blue-400 hover:text-white transition"
                        title="Twitter"
                      >
                        <Twitter className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
