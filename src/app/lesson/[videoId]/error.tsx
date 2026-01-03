'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LessonError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Lesson error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Failed to load lesson</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Could not generate the lesson. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
