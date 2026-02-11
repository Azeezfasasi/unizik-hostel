'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const defaultTeamMembers = [
  {
    name: 'Name',
    position: 'Position',
    photo: '/images/placeholder.png',
  },
  {
    name: 'Name',
    position: 'Position',
    photo: '/images/placeholder.png',
  },
  {
    name: 'Name',
    position: 'Position',
    photo: '/images/placeholder.png',
  },
  {
    name: 'Name',
    position: 'Position',
    photo: '/images/placeholder.png',
  },
];

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState(defaultTeamMembers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setTeamMembers(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        // Use default team members if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team combines expertise, technical excellence, and dedication to deliver outstanding support.
            </p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team combines industry expertise, technical excellence, and dedication to deliver outstanding support.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={member._id || index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden text-center p-6"
            >
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={member.photo?.url || member.photo || '/images/placeholder.png'}
                  alt={member.photo?.alt || member.name}
                  fill
                  sizes="100%"
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-gray-500">{member.position}</p>
              {member.bio && <p className="text-sm text-gray-600 mt-2">{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
