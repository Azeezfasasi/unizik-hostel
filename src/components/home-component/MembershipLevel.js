'use client'

import React, { useState, useEffect } from 'react'
import { Commet } from "react-loading-indicators";
import { Users, Heart, Church, Zap, Crown, Star, Gift, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link';

const iconMap = {
  Users,
  Heart,
  Church,
  Zap,
  Crown,
  Star,
  Gift,
  Shield
};

const defaultData = {
  levels: [
    {
      id: 1,
      title: 'Individual Member',
      description: 'For Christians committed to advocacy and mission.',
      iconName: 'Users',
      color: 'from-blue-500 to-blue-600',
      badge: 'Popular',
      highlighted: false,
    },
    {
      id: 2,
      title: 'Family Member',
      description: 'Engage as a household in prayer, service, and giving.',
      iconName: 'Heart',
      color: 'from-red-500 to-pink-600',
      badge: null,
      highlighted: true,
    },
    {
      id: 3,
      title: 'Church/Ministry Partner',
      description: 'For congregations supporting global Christian protection.',
      iconName: 'Church',
      color: 'from-purple-500 to-purple-600',
      badge: null,
      highlighted: false,
    },
    {
      id: 4,
      title: 'Youth & Young Adult Member',
      description: 'For emerging leaders and advocates.',
      iconName: 'Zap',
      color: 'from-yellow-500 to-orange-600',
      badge: null,
      highlighted: false,
    },
    {
      id: 5,
      title: 'Lifetime Member',
      description: 'For long-term champions of CANAN\'s work.',
      iconName: 'Crown',
      color: 'from-amber-600 to-yellow-600',
      badge: 'Premium',
      highlighted: false,
    },
  ],
  benefits: [
    { text: 'Access to updates' },
    { text: 'Events & gatherings' },
    { text: 'Advocacy actions' },
    { text: 'National briefings' },
    { text: 'Volunteer opportunities' },
  ],
  ctaSection: {
    title: 'Ready to Make a Difference?',
    description: 'Join our growing community of advocates and champions dedicated to Christian protection globally.',
    primaryButton: { label: 'Choose Your Membership', link: '#membership' },
    secondaryButton: { label: 'Learn More', link: '#' }
  }
};

const MembershipLevel = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/membershiplevel')
        const result = await res.json()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setData(defaultData)
        }
      } catch (err) {
        console.error('Failed to fetch membership levels:', err)
        setData(defaultData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-12 md:py-20 flex items-center justify-center">
        <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
      </section>
    )
  }

  const content = data || defaultData

  return (
    <section className="relative w-full py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Membership Levels
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Membership Categories
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Membership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {content.levels?.map((level) => {
            const Icon = iconMap[level.iconName] || Users
            return (
              <div
                key={level.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ease-out ${
                  level.highlighted
                    ? 'md:col-span-1 lg:col-span-1 ring-2 ring-offset-2 ring-red-500 scale-100 md:scale-105 shadow-2xl'
                    : 'shadow-lg hover:shadow-2xl'
                } hover:-translate-y-2`}
              >
                {/* Card Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-90`}
                ></div>

                {/* Badge */}
                {level.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                      {level.badge}
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="relative z-20 p-6 md:p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md group-hover:bg-white/30 transition-all duration-300 border border-white/30">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                    {level.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-white/90 mb-6 flex-grow">
                    {level.description}
                  </p>

                  {/* CTA Button */}
                  <Link href="/join-us"
                    className="w-full py-2 px-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 bg-white/20 hover:bg-white text-white hover:text-gray-900 border border-white/30 hover:border-white backdrop-blur-md text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What's Included in Every Membership
          </h2>
          <p className="text-gray-600 mb-6">
            Regardless of your membership level, you get access to:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {content.benefits?.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-300"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-800 font-medium text-sm md:text-base">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 md:mt-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {content.ctaSection?.title}
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {content.ctaSection?.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={content.ctaSection?.primaryButton?.link || '#membership'}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-block"
            >
              {content.ctaSection?.primaryButton?.label}
            </a>
            <a
              href={content.ctaSection?.secondaryButton?.link || '/membership'}
              className="px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 inline-block"
            >
              {content.ctaSection?.secondaryButton?.label}
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}

export default MembershipLevel
