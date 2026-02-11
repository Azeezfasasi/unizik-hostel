import React from 'react'
import Gallery from '@/components/home-component/Gallery'

export const metadata = {
  title: 'Gallery | CANAN USA',
  description: 'Learn more about our company, values, team, and what makes us different. Discover our mission and membership levels.',
  keywords: ['gallery', 'community', 'events', 'photos', 'videos'],
  openGraph: {
    title: 'Gallery | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
    type: 'website',
    url: 'https://cananusa.com/gallery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
  },
  robots: 'index, follow',
  canonical: 'https://cananusa.com/gallery',
}

export default function GalleryComponent() {
  return (
    <Gallery />
  )
}
