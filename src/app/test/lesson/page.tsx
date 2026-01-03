'use client'

import { useEffect } from 'react'
import { LessonCard, ExercisePanel, VocabularyList, useLessonStore } from '@/features/lesson/presentation'
import { Lesson, Exercise, VocabularyItem, Difficulty, ExerciseType } from '@/features/lesson/domain'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

/**
 * Create mock lesson data for E2E testing
 */
function createMockLesson(): Lesson {
  const videoIdResult = VideoId.fromId('dQw4w9WgXcQ')
  if (!videoIdResult.isSuccess) throw new Error('Failed to create VideoId')
  const videoId = videoIdResult.value

  const difficulty = Difficulty.medium()

  const exercise1Result = Exercise.create({
    id: 'ex-1',
    type: ExerciseType.fillBlank(),
    question: 'What is the capital of France?',
    answer: 'Paris',
    options: null,
    explanation: 'Paris is the capital and largest city of France.',
    chunkIndex: 0,
  })
  if (!exercise1Result.isSuccess) throw new Error('Failed to create Exercise 1')
  const exercise1 = exercise1Result.value

  const exercise2Result = Exercise.create({
    id: 'ex-2',
    type: ExerciseType.multipleChoice(),
    question: 'Which language is spoken in Brazil?',
    answer: 'Portuguese',
    options: ['Spanish', 'Portuguese', 'French', 'Italian'],
    explanation: 'Portuguese is the official language of Brazil.',
    chunkIndex: 1,
  })
  if (!exercise2Result.isSuccess) throw new Error('Failed to create Exercise 2')
  const exercise2 = exercise2Result.value

  const exercise3Result = Exercise.create({
    id: 'ex-3',
    type: ExerciseType.fillBlank(),
    question: 'The opposite of "hot" is ___.',
    answer: 'cold',
    options: null,
    explanation: 'Cold is the antonym of hot.',
    chunkIndex: 2,
  })
  if (!exercise3Result.isSuccess) throw new Error('Failed to create Exercise 3')
  const exercise3 = exercise3Result.value

  const vocab1Result = VocabularyItem.create({
    id: 'vocab-1',
    word: 'capital',
    definition: 'The most important city of a country, usually where the government is located',
    example: 'Paris is the capital of France.',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  })
  if (!vocab1Result.isSuccess) throw new Error('Failed to create VocabularyItem 1')
  const vocab1 = vocab1Result.value

  const vocab2Result = VocabularyItem.create({
    id: 'vocab-2',
    word: 'language',
    definition: 'A system of communication used by people in a particular country or region',
    example: 'English is a widely spoken language.',
    partOfSpeech: 'noun',
    chunkIndex: 1,
  })
  if (!vocab2Result.isSuccess) throw new Error('Failed to create VocabularyItem 2')
  const vocab2 = vocab2Result.value

  const vocab3Result = VocabularyItem.create({
    id: 'vocab-3',
    word: 'opposite',
    definition: 'Completely different; facing the other way',
    example: 'Up is the opposite of down.',
    partOfSpeech: 'adjective',
    chunkIndex: 2,
  })
  if (!vocab3Result.isSuccess) throw new Error('Failed to create VocabularyItem 3')
  const vocab3 = vocab3Result.value

  const lessonResult = Lesson.create({
    id: 'lesson-1',
    videoId,
    title: 'English Vocabulary Basics',
    difficulty,
    exercises: [exercise1, exercise2, exercise3],
    vocabulary: [vocab1, vocab2, vocab3],
  })
  if (!lessonResult.isSuccess) throw new Error('Failed to create Lesson')
  return lessonResult.value
}

/**
 * Test Lesson Page
 *
 * This page is for E2E testing of lesson presentation components.
 * It creates a mock lesson and initializes the store for testing.
 *
 * NOT FOR PRODUCTION USE
 */
export default function TestLessonPage() {
  const setLesson = useLessonStore((s) => s.setLesson)

  useEffect(() => {
    // Initialize store with mock lesson on mount
    const mockLesson = createMockLesson()
    setLesson(mockLesson)
  }, [setLesson])

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Lesson Test Page</h1>
      <p className="text-muted-foreground">
        This page is for E2E testing of lesson presentation components.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LessonCard />
          <ExercisePanel />
        </div>
        <div>
          <VocabularyList />
        </div>
      </div>
    </div>
  )
}
