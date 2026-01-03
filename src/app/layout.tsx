import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'YouFluent - Learn English with YouTube',
  description: 'Transform any YouTube video into an interactive English lesson with AI-powered exercises and vocabulary.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}
