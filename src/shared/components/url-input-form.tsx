'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

/**
 * UrlInputForm Component
 *
 * Form for entering YouTube URL and selecting difficulty.
 * Validates URL on submit and navigates to lesson page.
 *
 * PATTERN: Controlled form with client-side validation
 */
export function UrlInputForm() {
  // Form state
  const [url, setUrl] = useState('')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [error, setError] = useState<string>('')

  // Navigation
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /**
   * Handle form submission
   *
   * PRE: url is string, difficulty is 'easy'|'medium'|'hard'
   * POST: Navigates to /lesson/[videoId] or shows error
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate URL using VideoId value object
    const videoIdResult = VideoId.fromUrl(url)

    if (videoIdResult.isFailure) {
      setError('Please enter a valid YouTube URL')
      return
    }

    // Navigate to lesson page
    startTransition(() => {
      router.push(`/lesson/${videoIdResult.value.value}?difficulty=${difficulty}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          aria-label="YouTube URL"
          data-testid="url-input"
        />
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-32" data-testid="difficulty-select">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p
          className="text-sm text-destructive"
          role="alert"
          data-testid="error-message"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !url.trim()}
        data-testid="submit-button"
      >
        {isPending ? 'Loading...' : 'Start Learning'}
      </Button>
    </form>
  )
}
