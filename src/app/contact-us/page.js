import ContactUsMain from "@/components/home-component/ContactUsMain";
import PageTitle from "@/components/home-component/PageTitle";

export const metadata = {
  title: 'Contact Us | UNIZIK Hostel',
  description: 'Get in touch with UNIZIK Hostel for inquiries, support, or to join our community.',
  keywords: ['contact us', 'company', 'team', 'values', 'support'],
  openGraph: {
    title: 'Contact Us | UNIZIK Hostel',
    description: 'Get in touch with UNIZIK Hostel for inquiries, support, or to join our community.',
    type: 'website',
    url: 'https://unizikhostel.com/contact-us',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | UNIZIK Hostel',
    description: 'Get in touch with UNIZIK Hostel for inquiries, support, or to join our community.',
  },
  robots: 'index, follow',
  canonical: 'https://unizikhostel.com/contact-us',
}

export default function ContactUs() {
  return (
    <>
    <PageTitle title="Contact Us" subtitle="Get in touch with UNIZIK Hostel for inquiries, support, or to join our community." />
    <ContactUsMain />
    </>
  )
}
