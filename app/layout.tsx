import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadScout — AI-Powered Local Lead Intelligence',
  description: 'Find real local businesses and generate AI sales dossiers with cold emails.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Epilogue:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}