"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { ArrowBigRightDash, ArrowBigLeftDash } from 'lucide-react';
import { Commet } from "react-loading-indicators";

export default function Hero() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState({ active: false, startX: 0, dx: 0 })
  const containerRef = useRef(null)
  const [slideWidth, setSlideWidth] = useState(0)
  const [paused, setPaused] = useState(false)

  // Fetch slides from API on mount
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/hero')
        const result = await res.json()
        if (result.success && result.data.length > 0) {
          setSlides(result.data)
        } else {
          // Fallback to default slides if API fails
          setSlides(defaultSlides)
        }
      } catch (err) {
        console.error('Failed to fetch hero slides:', err)
        // Fallback to default slides
        setSlides(defaultSlides)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // Default slides fallback
  const defaultSlides = [
    {
      title: 'Welcome to UNIZIK Hostel',
      subtitle: 'Experience safe, affordable, and comfortable accommodation for students and visitors. Join our vibrant community and thrive academically and socially.',
      cta: { label: 'Check Availability', href: '/check-availability' },
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%)',
      image: { src: '/images/placeholder.png', alt: 'UNIZIK Hostel Community' }
    },
    {
      title: 'Safe & Affordable Accommodation',
      subtitle: 'Discover our range of safe, affordable, and comfortable housing options designed to meet the needs of students and visitors. Your comfort and security are our top priorities.',
      cta: { label: 'Login', href: '/login' },
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      image: { src: '/images/placeholder.png', alt: 'Religious Advocacy' }
    },
  ]

  // Note: index is controlled by setters below (clamped on update); no effect needed here.

  // pointer handlers (works for mouse & touch)
  function handlePointerDown(e) {
    const x = e.clientX ?? (e.touches && e.touches[0].clientX)
    setDrag({ active: true, startX: x, dx: 0 })
    setPaused(true)
  }

  function handlePointerMove(e) {
    if (!drag.active) return
    const x = e.clientX ?? (e.touches && e.touches[0].clientX)
    if (typeof x !== 'number') return
    setDrag(d => ({ ...d, dx: x - d.startX }))
  }

  function handlePointerUp() {
    if (!drag.active) { setPaused(false); return }
    const threshold = (containerRef.current?.offsetWidth || 600) * 0.15
    if (drag.dx > threshold) setIndex(i => Math.max(0, i - 1))
    else if (drag.dx < -threshold) setIndex(i => Math.min(slides.length - 1, i + 1))
    setDrag({ active: false, startX: 0, dx: 0 })
    setPaused(false)
  }

  // keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex(i => Math.min(slides.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  // track container width and update on resize so we translate by exact pixels
  useLayoutEffect(() => {
    function update() {
      const w = containerRef.current?.offsetWidth || 0
      setSlideWidth(w)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Auto-slide interval (pauses on hover or during drag)
  useEffect(() => {
    if (slides.length <= 1) return
    if (drag.active || paused) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [slides.length, drag.active, paused])

  return (
    <section className="w-full">
      <div className="mx-auto ">
        {loading && slides.length === 0 ? (
          <div className="h-[420px] md:h-[540px] flex items-center justify-center bg-gray-200">
            <p className="text-gray-600"><Commet color="#1e3a8a" size="medium" text="Loading" textColor="#ff0000" /></p>
          </div>
        ) : slides.length === 0 ? (
          <div className="h-[420px] md:h-[540px] flex items-center justify-center bg-gray-200">
            <p className="text-gray-600">No slides available</p>
          </div>
        ) : (
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: slideWidth
                ? `translateX(${-(index * slideWidth) + drag.dx}px)`
                : `translateX(calc(${-(index * 100)}% + ${drag.dx}px))`
            }}
          >
            {slides.map((s, i) => (
              <div key={i} className="min-w-full flex-none" style={{ flex: '0 0 100%' }}>
                <div className="h-[550px] md:h-[540px] flex items-center">
                  <div className="w-full h-full p-6 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-6" style={{ background: s.bg }}>
                    <div className="flex-1 max-w-full md:max-w-2xl">
                      <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">{s.title}</h2>
                      <p className="text-gray-300 mb-6">{s.subtitle}</p>
                      <div className="flex gap-3">
                        <Link href={s.cta.href} className="inline-block px-2 md:px-5 py-3 bg-red-500 text-white rounded-md font-medium">{s.cta.label}</Link>
                        <Link href="/about-us" className="inline-block px-2 md:px-5 py-3 border border-white rounded-md font-medium text-gray-300">Login</Link>
                      </div>
                    </div>
                    {/* Right Image - visible on lg (laptop) and up only */}
                    <div className="block shrink-0 w-full lg:w-[40%]">
                      <Image
                        src={s.image?.src}
                        alt={s.image?.alt}
                        width={420}
                        height={50}
                        className="rounded-2xl object-cover w-full h-full md:h-[500px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prev/Next arrows */}
          <button
            aria-label="Previous"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 md:bg-white/80 hover:bg-white p-0.5 md:p-2 rounded-full shadow-md text-blue-900 cursor-pointer"
          >
            <ArrowBigLeftDash />
          </button>
          <button
            aria-label="Next"
            onClick={() => setIndex(i => Math.min(slides.length - 1, i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 md:bg-white/80 hover:bg-white p-0.5 md:p-2 rounded-full shadow-md text-blue-900 cursor-pointer"
          >
            <ArrowBigRightDash />
          </button>          

          {/* Dots */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full ${i === index ? 'bg-blue-900' : 'bg-white/70 border border-gray-200'}`}
              />
            ))}
          </div>
          </div>
        )}
      </div>
    </section>
  )
}