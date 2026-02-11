import BlogNews from '@/components/home-component/BlogNews'
import PageTitle from '@/components/home-component/PageTitle'
import React from 'react'

export const metadata = {
  title: 'Blog | UNIZIK Hostel',
  description: 'Stay updated with the latest trends, insights, and news from the UNIZIK Hostel community',
  keywords: ['blog', 'news', 'insights', 'updates', 'UNIZIK Hostel'],
  openGraph: {
    title: 'Blog | UNIZIK Hostel',
    description: 'Stay updated with the latest trends, insights, and news from the UNIZIK Hostel community',
    type: 'website',
    url: 'https://unizikhostel.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | UNIZIK Hostel',
    description: 'Stay updated with the latest trends, insights, and news from the UNIZIK Hostel community',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/blog',
}

export default function page() {
  return (
    <>
    <PageTitle title="UNIZIK Hostel Insights & News" subtitle="Stay updated with the latest trends, insights, and news from the UNIZIK Hostel community" />
    <BlogNews />
    </>
  )
}
