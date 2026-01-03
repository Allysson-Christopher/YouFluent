import type {
  Lesson as PrismaLesson,
  Exercise as PrismaExercise,
  VocabularyItem as PrismaVocabularyItem,
} from '@prisma/client'
import {
  Lesson,
  Exercise,
  VocabularyItem,
  Difficulty,
  ExerciseType,
} from '@/features/lesson/domain'
import type { PartOfSpeech } from '@/features/lesson/domain'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

/**
 * Type for Prisma Lesson with relations included
 */
export type PrismaLessonWithRelations = PrismaLesson & {
  exercises: PrismaExercise[]
  vocabulary: PrismaVocabularyItem[]
}

/**
 * Type for Prisma Exercise data (without lessonId for nested writes)
 */
export interface PrismaExerciseData {
  id: string
  type: string
  question: string
  answer: string
  options: string[]
  explanation: string
  chunkIndex: number
}

/**
 * Type for Prisma VocabularyItem data (without lessonId for nested writes)
 */
export interface PrismaVocabularyData {
  id: string
  word: string
  definition: string
  example: string
  partOfSpeech: string
  chunkIndex: number
}

/**
 * Type for Prisma Lesson data for create operations
 */
export interface PrismaLessonData {
  id: string
  videoId: string
  title: string
  difficulty: string
  createdAt: Date
  exercises: PrismaExerciseData[]
  vocabulary: PrismaVocabularyData[]
}

/**
 * LessonMapper
 *
 * Bidirectional mapper between Prisma models and Domain entities.
 * Handles conversion of:
 * - Lesson aggregate with exercises and vocabulary
 * - Value objects (Difficulty, ExerciseType, PartOfSpeech)
 * - Options array: null <-> empty array
 */
export class LessonMapper {
  /**
   * Convert Prisma Lesson to Domain Lesson
   *
   * PRE: prismaLesson contains valid data with relations
   * POST: Returns Domain Lesson with all exercises and vocabulary
   *
   * @param prismaLesson - Prisma Lesson with exercises and vocabulary
   * @returns Domain Lesson entity
   */
  static toDomain(prismaLesson: PrismaLessonWithRelations): Lesson {
    // Map exercises
    const exercises = prismaLesson.exercises.map((pe) => {
      const typeResult = ExerciseType.fromString(pe.type)
      if (!typeResult.isSuccess) {
        throw new Error(`Invalid exercise type in database: ${pe.type}`)
      }

      // Convert empty array to null for domain
      const options = pe.options.length > 0 ? pe.options : null

      return Exercise.reconstitute({
        id: pe.id,
        type: typeResult.value,
        question: pe.question,
        answer: pe.answer,
        options,
        explanation: pe.explanation,
        chunkIndex: pe.chunkIndex,
      })
    })

    // Map vocabulary
    const vocabulary = prismaLesson.vocabulary.map((pv) => {
      return VocabularyItem.reconstitute({
        id: pv.id,
        word: pv.word,
        definition: pv.definition,
        example: pv.example,
        partOfSpeech: pv.partOfSpeech as PartOfSpeech,
        chunkIndex: pv.chunkIndex,
      })
    })

    // Map difficulty
    const difficultyResult = Difficulty.fromString(prismaLesson.difficulty)
    if (!difficultyResult.isSuccess) {
      throw new Error(`Invalid difficulty in database: ${prismaLesson.difficulty}`)
    }

    // Map videoId
    const videoIdResult = VideoId.fromId(prismaLesson.videoId)
    if (!videoIdResult.isSuccess) {
      throw new Error(`Invalid videoId in database: ${prismaLesson.videoId}`)
    }

    // Reconstitute lesson
    return Lesson.reconstitute({
      id: prismaLesson.id,
      videoId: videoIdResult.value,
      title: prismaLesson.title,
      difficulty: difficultyResult.value,
      exercises,
      vocabulary,
      createdAt: prismaLesson.createdAt,
    })
  }

  /**
   * Convert Domain Lesson to Prisma data format
   *
   * PRE: lesson is a valid Domain Lesson
   * POST: Returns data suitable for Prisma create operations
   *
   * @param lesson - Domain Lesson entity
   * @returns Prisma-compatible data for create/upsert
   */
  static toPrisma(lesson: Lesson): PrismaLessonData {
    // Map exercises - convert null options to empty array
    // Spread to create mutable array copy from readonly
    const exercises: PrismaExerciseData[] = lesson.exercises.map((e) => ({
      id: e.id,
      type: e.type.value,
      question: e.question,
      answer: e.answer,
      options: e.options ? [...e.options] : [],
      explanation: e.explanation,
      chunkIndex: e.chunkIndex,
    }))

    // Map vocabulary
    const vocabulary: PrismaVocabularyData[] = lesson.vocabulary.map((v) => ({
      id: v.id,
      word: v.word,
      definition: v.definition,
      example: v.example,
      partOfSpeech: v.partOfSpeech,
      chunkIndex: v.chunkIndex,
    }))

    return {
      id: lesson.id,
      videoId: lesson.videoId.value,
      title: lesson.title,
      difficulty: lesson.difficulty.value,
      createdAt: lesson.createdAt,
      exercises,
      vocabulary,
    }
  }
}
