import MainHeader from '@/components/home-component/MainHeader'
import MembershipLevel from '@/components/home-component/MembershipLevel'
import MemberSupport from '@/components/home-component/MemberSupport'
import React from 'react'

export const metadata = {
  title: 'Membership | CANAN USA',
  description: 'Explore CANAN USA membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
  keywords: ['membership', 'levels', 'benefits', 'join', 'community'],
  openGraph: {
    title: 'Membership | CANAN USA',
    description: 'Explore CANAN USA membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
    type: 'website',
    url: 'https://cananusa.com/membership',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership | CANAN USA',
    description: 'Explore CANAN USA membership levels and benefits. Join our community to access exclusive resources, events, and support tailored for our members.',
  },
  robots: 'index, follow',
  canonical: 'https://cananusa.com/membership',
}

export default function Membership() {
  return (
    <>
    <MembershipLevel />
    <MemberSupport />
    </>
  )
}
