'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { useLessonStore } from '../stores/lesson-store'

/**
 * Difficulty level to color mapping
 */
const difficultyColors = {
  easy: 'bg-green-500 hover:bg-green-500',
  medium: 'bg-yellow-500 hover:bg-yellow-500',
  hard: 'bg-red-500 hover:bg-red-500',
} as const

/**
 * LessonCard Component
 *
 * Displays a summary of the current lesson including:
 * - Title
 * - Difficulty badge (color-coded)
 * - Exercise and vocabulary counts
 * - Progress bar
 * - Completion message with score
 *
 * Uses Zustand store for state management.
 */
export function LessonCard() {
  const lesson = useLessonStore((s) => s.lesson)
  const score = useLessonStore((s) => s.score)
  const isComplete = useLessonStore((s) => s.isComplete)
  const getProgress = useLessonStore((s) => s.getProgress)

  if (!lesson) {
    return (
      <div className="text-muted-foreground" data-testid="lesson-card-loading">
        Loading lesson...
      </div>
    )
  }

  const progress = getProgress()

  return (
    <Card data-testid="lesson-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle data-testid="lesson-title">{lesson.title}</CardTitle>
          <Badge
            className={difficultyColors[lesson.difficulty.value]}
            data-testid="lesson-difficulty"
          >
            {lesson.difficulty.value}
          </Badge>
        </div>
        <CardDescription data-testid="lesson-stats">
          {lesson.exerciseCount} exercises - {lesson.vocabularyCount} vocabulary words
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span data-testid="lesson-progress-text">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} data-testid="lesson-progress-bar" />
          {isComplete && (
            <div
              className="text-center p-4 bg-muted rounded-lg mt-4"
              data-testid="lesson-complete"
            >
              <p className="text-lg font-semibold">Lesson Complete!</p>
              <p data-testid="lesson-score">
                Score: {score}/{lesson.exerciseCount}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
