'use client'

import { useEffect } from 'react'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import { Lesson } from '@/features/lesson/domain/entities/lesson'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { VocabularyItem, type PartOfSpeech } from '@/features/lesson/domain/entities/vocabulary-item'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import type { LessonActionResult } from './actions'

interface LessonProviderProps {
  data: NonNullable<LessonActionResult['data']>
  children: React.ReactNode
}

/**
 * LessonProvider Component
 *
 * Hydrates Zustand stores with server data.
 * Reconstructs domain entities from serialized data.
 *
 * PATTERN: Client component that wraps lesson page content
 */
export function LessonProvider({ data, children }: LessonProviderProps) {
  const setLesson = useLessonStore((s) => s.setLesson)
  const setChunks = usePlayerStore((s) => s.setChunks)

  useEffect(() => {
    // Reconstruct Lesson entity from serialized data
    const lessonData = data.lesson

    // Reconstruct exercises
    const exercises = lessonData.exercises.map(e => {
      const typeResult = ExerciseType.fromString(e.type)
      const exerciseResult = Exercise.create({
        id: e.id,
        type: typeResult.isSuccess ? typeResult.value : ExerciseType.multipleChoice(),
        question: e.question,
        answer: e.answer,
        options: e.options,
        explanation: e.explanation,
        chunkIndex: e.chunkIndex,
      })
      return exerciseResult.isSuccess ? exerciseResult.value : null
    }).filter((e): e is Exercise => e !== null)

    // Reconstruct vocabulary
    const vocabulary = lessonData.vocabulary.map(v => {
      const vocabResult = VocabularyItem.create({
        id: v.id,
        word: v.word,
        definition: v.definition,
        example: v.example,
        partOfSpeech: v.partOfSpeech as PartOfSpeech,
        chunkIndex: v.chunkIndex,
      })
      return vocabResult.isSuccess ? vocabResult.value : null
    }).filter((v): v is VocabularyItem => v !== null)

    // Reconstruct lesson
    const videoIdResult = VideoId.fromId(lessonData.videoId)
    const difficultyResult = Difficulty.fromString(lessonData.difficulty)

    if (videoIdResult.isSuccess && difficultyResult.isSuccess) {
      const lessonResult = Lesson.create({
        id: lessonData.id,
        videoId: videoIdResult.value,
        title: lessonData.title,
        difficulty: difficultyResult.value,
        exercises,
        vocabulary,
      })

      if (lessonResult.isSuccess) {
        setLesson(lessonResult.value)
      }
    }

    // Reconstruct chunks for player
    if (data.transcript) {
      const chunks = data.transcript.chunks.map(c => {
        const chunkResult = Chunk.create({
          id: c.id,
          index: c.index,
          startTime: c.startTime,
          endTime: c.endTime,
          text: c.text,
        })
        return chunkResult.isSuccess ? chunkResult.value : null
      }).filter((c): c is Chunk => c !== null)

      setChunks(chunks)
    }
  }, [data, setLesson, setChunks])

  return <>{children}</>
}
