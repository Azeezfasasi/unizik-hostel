import React from 'react'
import Hero from '@/components/home-component/Hero'
import HomeAbout from '@/components/home-component/HomeAbout'
import TestimonialsSection from '@/components/home-component/TestimonialsSection'
import SubscribeToNewsletter from '@/components/home-component/SubscribeToNewsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeAbout />
      <TestimonialsSection />
      <SubscribeToNewsletter />
    </>
  )
}
