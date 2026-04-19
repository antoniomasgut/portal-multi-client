import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AMG Enginyeria Digital — Portal',
  description: 'Portal de gestió multi-client',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&family=Orbitron:wght@700;900&family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@400;700;900&family=Merriweather:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-0 text-[#e0e0f0] font-rajdhani antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
