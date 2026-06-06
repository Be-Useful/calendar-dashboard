import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'DSA Advanced Training Dashboard',
  description: '10-Week Extensive Problem Solving Bootcamp',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
