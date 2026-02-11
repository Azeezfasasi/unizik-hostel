import '../globals.css'
import MainHeader from '@/components/home-component/MainHeader'
import Footer from '@/components/home-component/Footer'
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: 'UNIZIK Hostel - The hostel with Discipline, Self-Reliance and Excellence',
  description: 'UNIZIK Hostel is a premier accommodation facility that offers a comfortable and secure living environment for students. With a focus on discipline, self-reliance, and excellence, UNIZIK Hostel provides a supportive community where students can thrive academically and personally. Our hostel is equipped with modern amenities, including spacious rooms, study areas, recreational facilities, and 24/7 security to ensure the well-being of our residents. Join us at UNIZIK Hostel and experience a vibrant and enriching living experience that fosters growth and success.',
  icons: {
    icon: '/canannew.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="site-main-header sticky top-0 z-50">
            <MainHeader />
          </div>
          <main>{children}</main>
          <div className="site-main-header">
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
