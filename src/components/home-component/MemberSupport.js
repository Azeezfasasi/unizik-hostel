'use client'

import React, { useState, useEffect } from "react";
import { Commet } from "react-loading-indicators";
import {
  FaBuilding,
  FaHandshake,
  FaBalanceScale,
  FaFolderOpen,
  FaGraduationCap,
  FaGlobe,
  FaHeart,
  FaShieldAlt,
  FaUsers,
  FaBriefcase,
  FaBook,
  FaCross,
  FaArrowRight,
} from "react-icons/fa";

// Icon mapping
const iconMap = {
  FaBuilding,
  FaHandshake,
  FaBalanceScale,
  FaFolderOpen,
  FaGraduationCap,
  FaGlobe,
  FaHeart,
  FaShieldAlt,
  FaUsers,
  FaBriefcase,
  FaBook,
  FaCross,
};

// Default content
const defaultContent = {
  sectionTitle: 'What Members Support',
  sectionDescription: 'Your membership fuels impactful initiatives that advance advocacy, faith, and community development across the globe.',
  supportItems: [
    {
      icon: FaBuilding,
      title: "Congressional Engagement",
      text: "Congressional engagement and policy advocacy",
      color: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
    },
    {
      icon: FaBuilding,
      title: "Awareness Campaigns",
      text: "Awareness campaigns on Christian persecution",
      color: "from-red-500 to-red-600",
      lightBg: "bg-red-50",
    },
    {
      icon: FaHandshake,
      title: "Humanitarian Support",
      text: "Missions and humanitarian support in crisis regions",
      color: "from-green-500 to-green-600",
      lightBg: "bg-green-50",
    },
    {
      icon: FaBalanceScale,
      title: "Legal Interventions",
      text: "Legal and diplomatic interventions",
      color: "from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
    },
    {
      icon: FaFolderOpen,
      title: "Prayer Mobilizations",
      text: "National prayer mobilizations",
      color: "from-pink-500 to-pink-600",
      lightBg: "bg-pink-50",
    },
    {
      icon: FaGraduationCap,
      title: "Leadership Development",
      text: "Leadership development for Nigerian Americans",
      color: "from-amber-500 to-amber-600",
      lightBg: "bg-amber-50",
    },
    {
      icon: FaGlobe,
      title: "Community Events",
      text: "Community events, summits, and training programs",
      color: "from-teal-500 to-teal-600",
      lightBg: "bg-teal-50",
    },
  ],
  ctaSection: {
    title: 'Your Partnership Strengthens the Global Church',
    description: 'Join thousands of advocates committed to protecting persecuted Christians worldwide.',
    buttonLabel: 'Become a Member Today',
    buttonLink: '/join-us'
  },
  statsSection: [
    {
      number: '7+',
      title: 'Core Impact Areas',
      description: 'Comprehensive support across advocacy, faith, and community',
      color: 'blue'
    },
    {
      number: 'Global',
      title: 'Worldwide Reach',
      description: 'Supporting persecuted Christians in crisis regions',
      color: 'purple'
    },
    {
      number: 'Unified',
      title: 'Collective Impact',
      description: 'Your membership creates lasting change',
      color: 'green'
    }
  ]
};

const statColorMap = {
  blue: 'text-blue-600 border-blue-500',
  purple: 'text-purple-600 border-purple-500',
  green: 'text-green-600 border-green-500',
  red: 'text-red-600 border-red-500',
  orange: 'text-orange-600 border-orange-500',
  pink: 'text-pink-600 border-pink-500',
  teal: 'text-teal-600 border-teal-500',
};

export default function MemberSupport() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/membersupport')
        const result = await res.json()
        if (result.success) {
          setContent(result.data)
        } else {
          setContent(defaultContent)
        }
      } catch (err) {
        console.error('Failed to fetch member support content:', err)
        setContent(defaultContent)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-12 md:py-20 flex items-center justify-center">
        <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
      </section>
    )
  }

  const data = content || defaultContent
  
  // Convert icon names to actual icon components
  const processedItems = data.supportItems.map(item => ({
    ...item,
    icon: iconMap[item.iconName] || FaBuilding
  }))

  return (
    <section className="relative w-full py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {data.sectionTitle}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data.sectionDescription}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Support Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
          {processedItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`support-item-${index}`}
                className="group relative h-full"
              >
                {/* Card */}
                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 border border-gray-100">
                  {/* Top Gradient Bar */}
                  <div
                    className={`h-1 bg-gradient-to-r ${item.color}`}
                  ></div>

                  {/* Icon Background */}
                  <div className={`pt-6 px-6 ${item.lightBg}`}>
                    <div className="relative inline-block">
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}
                      ></div>
                      <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                      {item.text}
                    </p>

                    {/* Arrow accent */}
                    <div className="flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Explore more</span>
                      <FaArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-red-700 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative px-6 md:px-12 py-10 md:py-16 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20"></div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                {data.ctaSection?.title}
              </h3>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                {data.ctaSection?.description}
              </p>
              <a
                href={data.ctaSection?.buttonLink || '/join-us'}
                className="inline-flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-tr from-blue-500 to-green-500 text-white font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-base md:text-lg"
              >
                {data.ctaSection?.buttonLabel}
                <FaArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Stats or additional info */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.statsSection.map((stat, index) => (
            <div key={index} className={`bg-white rounded-xl p-6 md:p-8 shadow-lg text-center border-l-4 ${statColorMap[stat.color] || statColorMap.blue}`}>
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${statColorMap[stat.color]}`}>
                {stat.number}
              </div>
              <p className="text-gray-700 font-semibold">
                {stat.title}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
