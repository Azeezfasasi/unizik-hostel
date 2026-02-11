export const metadata = {
  title: 'Blog | UNIZIK Hostel',
  description: 'Explore insightful articles and updates from UNIZIK Hostel.',
  keywords: ['about us', 'company', 'team', 'values', 'membership'],
  openGraph: {
    title: 'Blog | UNIZIK Hostel',
    description: 'Explore insightful articles and updates from UNIZIK Hostel.',
    type: 'website',
    url: 'https://unizikhostel.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | UNIZIK Hostel',
    description: 'Explore insightful articles and updates from UNIZIK Hostel.',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/blog',
}

export default function LeadershipLayout({ children }) {
  return children
}