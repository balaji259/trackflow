import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from './components/Navbar'
import Script from 'next/script'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'TrackFlow',
  description: 'Jira-inspired project management system'
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang='en'>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          {children}

          {/* Jotform Agent Script */}
          <Script
            src='https://cdn.jotfor.ms/agent/embedjs/019a862f6f3a73a5bce2e4e956a3bc8db663/embed.js'
            strategy='afterInteractive'
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
