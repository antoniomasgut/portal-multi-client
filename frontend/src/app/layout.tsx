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
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&family=Orbitron:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-0 text-[#e0e0f0] font-rajdhani antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
