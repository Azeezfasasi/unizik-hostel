import React from 'react'
import CompanyOverview from '@/components/home-component/CompanyOverview'
import MembershipLevel from '@/components/home-component/MembershipLevel'
import PageTitle from '@/components/home-component/PageTitle'
import TeamSection from '@/components/home-component/TeamSection'
import WhyChooseUs from '@/components/home-component/WhyChooseUs'

export const metadata = {
  title: 'About Us | UNIZIK Hostel',
  description: 'Learn more about unizik hostel, our values, team, and what makes us different.',
  keywords: ['UNIZIK Hostel', 'About Us', 'Company Overview', 'Why Choose Us'],
  openGraph: {
    title: 'About Us | UNIZIK Hostel',
    description: 'Learn more about our company, values, team, and what makes us different.',
    type: 'website',
    url: 'https://unizikhostel.com/about-us',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | UNIZIK Hostel',
    description: 'Learn more about our company, values, team, and what makes us different.',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/about-us',
}

export default function page() {
  return (
    <>
    <PageTitle title="About Us" subtitle="Learn more about our company and values" />
    <CompanyOverview />
    <MembershipLevel />
    <TeamSection />
    <WhyChooseUs />
    </>
  )
}
