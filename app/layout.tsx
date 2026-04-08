import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AI Chat Assistant | Intelligent Conversations',
  description: 'Chat with an intelligent AI assistant. Have natural, helpful conversations powered by advanced language models.',
  generator: 'v0.app',
  keywords: ['AI', 'Chat', 'Assistant', 'Conversation', 'AI Chat'],
  openGraph: {
    title: 'AI Chat Assistant',
    description: 'Intelligent conversations powered by AI',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: 'icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: 'apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
