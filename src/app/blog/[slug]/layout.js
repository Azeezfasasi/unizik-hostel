export const metadata = {
  title: 'Blog | CANAN USA',
  description: 'Learn more about our company, values, team, and what makes us different. Discover our mission and membership levels.',
  keywords: ['about us', 'company', 'team', 'values', 'membership'],
  openGraph: {
    title: 'Blog | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
    type: 'website',
    url: 'https://cananusa.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
  },
  robots: 'index, follow',
  canonical: 'https://cananusa.com/blog',
}

export default function LeadershipLayout({ children }) {
  return children
}