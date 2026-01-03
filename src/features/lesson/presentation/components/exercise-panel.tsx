'use client'

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useLessonStore } from '../stores/lesson-store'
import { cn } from '@/shared/lib/utils'

/**
 * ExercisePanel Component
 *
 * Displays the current exercise and handles user interaction:
 * - Renders fill-blank exercises with text input
 * - Renders multiple-choice exercises with clickable options
 * - Shows feedback (correct/incorrect) after answering
 * - Provides navigation between exercises
 *
 * Uses Zustand store for state management.
 */
export function ExercisePanel() {
  const [userAnswer, setUserAnswer] = useState('')

  const lesson = useLessonStore((s) => s.lesson)
  const currentExerciseIndex = useLessonStore((s) => s.currentExerciseIndex)
  const getCurrentExercise = useLessonStore((s) => s.getCurrentExercise)
  const submitAnswer = useLessonStore((s) => s.submitAnswer)
  const nextExercise = useLessonStore((s) => s.nextExercise)
  const previousExercise = useLessonStore((s) => s.previousExercise)
  const isAnswerCorrect = useLessonStore((s) => s.isAnswerCorrect)
  const answers = useLessonStore((s) => s.answers)

  const exercise = getCurrentExercise()

  if (!exercise) {
    return (
      <div className="text-muted-foreground" data-testid="exercise-panel-empty">
        No exercise available
      </div>
    )
  }

  const answered = answers.has(exercise.id)
  const correct = isAnswerCorrect(exercise.id)
  const userSubmittedAnswer = answers.get(exercise.id)

  const handleSubmit = () => {
    if (!userAnswer.trim()) return
    submitAnswer(exercise.id, userAnswer)
    setUserAnswer('')
  }

  const handleOptionClick = (option: string) => {
    submitAnswer(exercise.id, option)
  }

  const handleNext = () => {
    nextExercise()
    setUserAnswer('')
  }

  const isLastExercise = currentExerciseIndex === (lesson?.exerciseCount ?? 1) - 1

  return (
    <Card data-testid="exercise-panel">
      <CardHeader>
        <CardTitle className="text-base" data-testid="exercise-header">
          Exercise {currentExerciseIndex + 1} of {lesson?.exerciseCount}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg" data-testid="exercise-question">
          {exercise.question}
        </p>

        {exercise.type.value === 'multiple-choice' && exercise.options ? (
          <div className="grid gap-2" data-testid="exercise-options">
            {exercise.options.map((option, i) => (
              <Button
                key={i}
                variant={answered && option === exercise.answer ? 'default' : 'outline'}
                className={cn(
                  'justify-start',
                  answered && option === exercise.answer && 'bg-green-500 hover:bg-green-500',
                  answered &&
                    option !== exercise.answer &&
                    userSubmittedAnswer === option &&
                    'bg-red-500 hover:bg-red-500'
                )}
                onClick={() => handleOptionClick(option)}
                disabled={answered}
                data-testid={`option-${i}`}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2" data-testid="exercise-input-area">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={answered}
              data-testid="answer-input"
              onKeyDown={(e) => e.key === 'Enter' && !answered && handleSubmit()}
            />
            <Button
              onClick={handleSubmit}
              disabled={answered || !userAnswer.trim()}
              data-testid="submit-button"
            >
              Submit
            </Button>
          </div>
        )}

        {answered && (
          <div
            className={cn(
              'p-3 rounded-lg',
              correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}
            data-testid="exercise-feedback"
          >
            {correct ? 'Correct!' : `Incorrect. The answer is: ${exercise.answer}`}
            {exercise.explanation && (
              <p className="mt-2 text-sm opacity-80" data-testid="exercise-explanation">
                {exercise.explanation}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          onClick={previousExercise}
          disabled={currentExerciseIndex === 0}
          data-testid="prev-button"
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!answered} data-testid="next-button">
          {isLastExercise ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}
