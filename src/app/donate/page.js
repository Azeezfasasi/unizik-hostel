import React from 'react'
import DonationForm from '@/components/DonationForm'

export const metadata = {
  title: 'Donate - CANAN USA',
  description: 'Support CANAN USA with your donation. Help us serve the community and spread God\'s love.',
}

export default function Donate() {
  return (
    <div>
      <DonationForm />
    </div>
  )
}
