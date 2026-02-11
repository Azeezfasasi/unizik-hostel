export const metadata = {
  title: 'Gallery | UNIZIK Hostel',
  description: 'Explore our gallery showcasing vibrant moments, events, and the lively community at UNIZIK Hostel.',
  keywords: ['gallery', 'photos', 'images', 'company', 'about us'],
  openGraph: {
    title: 'Gallery | UNIZIK Hostel',
    description: 'Explore our gallery showcasing vibrant moments, events, and the lively community at UNIZIK Hostel.',
    type: 'website',
    url: 'https://unizikhostel.com/gallery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | UNIZIK Hostel',
    description: 'Explore our gallery showcasing vibrant moments, events, and the lively community at UNIZIK Hostel.',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/gallery',
}

export default function GalleryLayout({ children }) {
  return children
}