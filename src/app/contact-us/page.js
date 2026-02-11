import ContactUsMain from "@/components/home-component/ContactUsMain";
import PageTitle from "@/components/home-component/PageTitle";

export const metadata = {
  title: 'Contact Us | CANAN USA',
  description: 'Learn more about our company, values, team, and what makes us different.',
  keywords: ['contact us', 'company', 'team', 'values', 'support'],
  openGraph: {
    title: 'Contact Us | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
    type: 'website',
    url: 'https://cananusa.com/contact-us',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | CANAN USA',
    description: 'Learn more about our company, values, team, and what makes us different.',
  },
  robots: 'index, follow',
  canonical: 'https://cananusa.com/contact-us',
}

export default function ContactUs() {
  return (
    <>
    <PageTitle title="Contact Us" subtitle="Have questions or want to join us? Reach out using the form below or through our contact details." />
    <ContactUsMain />
    </>
  )
}
