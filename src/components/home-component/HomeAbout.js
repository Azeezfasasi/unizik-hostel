'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Commet } from "react-loading-indicators";

export default function HomeAbout() {
  const [section, setSection] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch welcome section on mount
  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await fetch('/api/welcome')
        const result = await res.json()
        if (result.success && result.data.length > 0) {
          setSection(result.data[0])
        } else {
          setSection(defaultSection)
        }
      } catch (err) {
        console.error('Failed to fetch welcome section:', err)
        setSection(defaultSection)
      } finally {
        setLoading(false)
      }
    }

    fetchWelcome()
  }, [])

  // Default section fallback
  const defaultSection = {
    title: 'About UNIZIK Hostel',
    description1: 'UNIZIK Hostel is a dedicated accommodation facility for students and visitors of the University of Nigeria, Nsukka. We provide safe, affordable, and comfortable housing options designed to meet the needs of our community members.',
    description2: 'Our hostel is committed to creating a supportive environment that fosters academic excellence, personal growth, and social interaction. We ensure that all residents have access to essential amenities and services that enhance their living experience.',
    image: { src: '/images/placeholder.png', alt: 'UNIZIK Hostel Community' },
    button: { label: 'Learn More', href: '/about-us' }
  }

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20 flex justify-center">
          <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
        </div>
      </section>
    )
  }

  if (!section) {
    return null
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-10">
        
        {/* Image */}
        <div className="flex-1 w-full">
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={section.image?.src || defaultSection.image.src} 
              alt={section.image?.alt || defaultSection.image.alt}
              fill
              sizes='100%'
              className="object-fill"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            {section.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {section.description1}
          </p>
          {section.description2 && (
            <p className="text-gray-600 mb-6">
              {section.description2}
            </p>
          )}

          <a
            href={section.button?.href || defaultSection.button.href}
            className="inline-block bg-gradient-to-tr from-red-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-800 transition"
          >
            {section.button?.label || defaultSection.button.label}
          </a>
        </div>

      </div>
    </section>
  );
}
