import BlogNews from '@/components/home-component/BlogNews'
import PageTitle from '@/components/home-component/PageTitle'
import React from 'react'

export const metadata = {
  title: 'Blog | CANAN USA',
  description: 'Stay updated with the latest trends, insights, and news from the CANAN USA community',
  keywords: ['blog', 'news', 'insights', 'updates', 'CANAN USA'],
  openGraph: {
    title: 'Blog | CANAN USA',
    description: 'Stay updated with the latest trends, insights, and news from the CANAN USA community',
    type: 'website',
    url: 'https://cananusa.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | CANAN USA',
    description: 'Stay updated with the latest trends, insights, and news from the CANAN USA community',
  },
  robots: 'index, follow',
  canonical: 'https://cananusa.com/blog',
}

export default function page() {
  return (
    <>
    <PageTitle title="CANAN USA Insights & News" subtitle="Stay updated with the latest trends, insights, and news from the CANAN USA community" />
    <BlogNews />
    </>
  )
}
