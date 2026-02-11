import '../globals.css'
import MainHeader from '@/components/home-component/MainHeader'
import Footer from '@/components/home-component/Footer'
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: 'The Christian Association of Nigerian- Americans (CANAN USA)',
  description: 'The Christian Association of Nigerian-Americans (CANAN USA) is a faith-based organization dedicated to fostering spiritual growth, community support, and cultural connection among Nigerian-Americans. We provide a platform for worship, fellowship, and outreach, promoting Christian values and unity within the diaspora.',
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
