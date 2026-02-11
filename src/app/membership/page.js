import MainHeader from '@/components/home-component/MainHeader'
import MembershipLevel from '@/components/home-component/MembershipLevel'
import MemberSupport from '@/components/home-component/MemberSupport'
import React from 'react'

export const metadata = {
  title: 'Membership | Unizik Hostel',
  description: 'Explore UNIZIK Hostel membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
  keywords: ['membership', 'levels', 'benefits', 'join', 'community'],
  openGraph: {
    title: 'Membership | Unizik Hostel',
    description: 'Explore UNIZIK Hostel membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
    type: 'website',
    url: 'https://unizikhostel.com/membership',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership | UNIZIK Hostel',
    description: 'Explore UNIZIK Hostel membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/membership',
}

export default function Membership() {
  return (
    <>
    <MembershipLevel />
    <MemberSupport />
    </>
  )
}
