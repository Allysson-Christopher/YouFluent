import { describe, it, expect } from 'vitest'
import type {
  Lesson as PrismaLesson,
  Exercise as PrismaExercise,
  VocabularyItem as PrismaVocabularyItem,
} from '@prisma/client'
import { LessonMapper } from '@/features/lesson/infrastructure/mappers/lesson-mapper'
import { Lesson, Exercise, VocabularyItem, Difficulty, ExerciseType } from '@/features/lesson/domain'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

/**
 * Type for Prisma Lesson with relations
 */
type PrismaLessonWithRelations = PrismaLesson & {
  exercises: PrismaExercise[]
  vocabulary: PrismaVocabularyItem[]
}

/**
 * Factory to create test Prisma Lesson data
 */
function createPrismaLesson(overrides?: Partial<PrismaLessonWithRelations>): PrismaLessonWithRelations {
  return {
    id: 'lesson-123',
    videoId: 'dQw4w9WgXcQ',
    title: 'Test Lesson',
    difficulty: 'medium',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    exercises: [
      {
        id: 'exercise-1',
        type: 'fill-blank',
        question: 'Complete: I ___ to the store.',
        answer: 'went',
        options: [],
        explanation: 'Past tense of go',
        chunkIndex: 0,
        lessonId: 'lesson-123',
      },
      {
        id: 'exercise-2',
        type: 'multiple-choice',
        question: 'What is the correct word?',
        answer: 'happy',
        options: ['sad', 'happy', 'angry'],
        explanation: 'Happy is correct',
        chunkIndex: 1,
        lessonId: 'lesson-123',
      },
    ],
    vocabulary: [
      {
        id: 'vocab-1',
        word: 'serendipity',
        definition: 'The occurrence of events by chance',
        example: 'Finding that book was serendipity.',
        partOfSpeech: 'noun',
        chunkIndex: 0,
        lessonId: 'lesson-123',
      },
    ],
    ...overrides,
  }
}

/**
 * Factory to create test domain Lesson
 */
function createDomainLesson(): Lesson {
  const videoIdResult = VideoId.fromId('dQw4w9WgXcQ')
  if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

  const exerciseResult = Exercise.create({
    id: 'exercise-1',
    type: ExerciseType.fillBlank(),
    question: 'Complete: I ___ to the store.',
    answer: 'went',
    options: null,
    explanation: 'Past tense of go',
    chunkIndex: 0,
  })
  if (!exerciseResult.isSuccess) throw new Error('Invalid exercise')

  const exercise2Result = Exercise.create({
    id: 'exercise-2',
    type: ExerciseType.multipleChoice(),
    question: 'What is the correct word?',
    answer: 'happy',
    options: ['sad', 'happy', 'angry'],
    explanation: 'Happy is correct',
    chunkIndex: 1,
  })
  if (!exercise2Result.isSuccess) throw new Error('Invalid exercise 2')

  const vocabResult = VocabularyItem.create({
    id: 'vocab-1',
    word: 'serendipity',
    definition: 'The occurrence of events by chance',
    example: 'Finding that book was serendipity.',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  })
  if (!vocabResult.isSuccess) throw new Error('Invalid vocabulary')

  const lessonResult = Lesson.create({
    id: 'lesson-123',
    videoId: videoIdResult.value,
    title: 'Test Lesson',
    difficulty: Difficulty.medium(),
    exercises: [exerciseResult.value, exercise2Result.value],
    vocabulary: [vocabResult.value],
  })
  if (!lessonResult.isSuccess) throw new Error('Invalid lesson')

  return lessonResult.value
}

describe('LessonMapper', () => {
  describe('toDomain', () => {
    it('converts Prisma lesson to domain Lesson', () => {
      const prismaLesson = createPrismaLesson()

      const domainLesson = LessonMapper.toDomain(prismaLesson)

      expect(domainLesson.id).toBe('lesson-123')
      expect(domainLesson.videoId.value).toBe('dQw4w9WgXcQ')
      expect(domainLesson.title).toBe('Test Lesson')
      expect(domainLesson.difficulty.value).toBe('medium')
      expect(domainLesson.createdAt).toEqual(new Date('2024-01-15T10:00:00Z'))
    })

    it('converts exercises with correct types', () => {
      const prismaLesson = createPrismaLesson()

      const domainLesson = LessonMapper.toDomain(prismaLesson)

      expect(domainLesson.exercises.length).toBe(2)

      const fillBlank = domainLesson.exercises[0]
      expect(fillBlank.id).toBe('exercise-1')
      expect(fillBlank.type.value).toBe('fill-blank')
      expect(fillBlank.question).toBe('Complete: I ___ to the store.')
      expect(fillBlank.answer).toBe('went')
      expect(fillBlank.options).toBeNull() // Empty array -> null
      expect(fillBlank.explanation).toBe('Past tense of go')
      expect(fillBlank.chunkIndex).toBe(0)

      const multipleChoice = domainLesson.exercises[1]
      expect(multipleChoice.id).toBe('exercise-2')
      expect(multipleChoice.type.value).toBe('multiple-choice')
      expect(multipleChoice.options).toEqual(['sad', 'happy', 'angry'])
    })

    it('converts vocabulary with correct partOfSpeech', () => {
      const prismaLesson = createPrismaLesson()

      const domainLesson = LessonMapper.toDomain(prismaLesson)

      expect(domainLesson.vocabulary.length).toBe(1)

      const vocab = domainLesson.vocabulary[0]
      expect(vocab.id).toBe('vocab-1')
      expect(vocab.word).toBe('serendipity')
      expect(vocab.definition).toBe('The occurrence of events by chance')
      expect(vocab.example).toBe('Finding that book was serendipity.')
      expect(vocab.partOfSpeech).toBe('noun')
      expect(vocab.chunkIndex).toBe(0)
    })

    it('handles empty options array as null for non-multiple-choice', () => {
      const prismaLesson = createPrismaLesson({
        exercises: [
          {
            id: 'exercise-1',
            type: 'translation',
            question: 'Translate: Hello',
            answer: 'Hola',
            options: [], // Empty array in Prisma
            explanation: 'Basic greeting',
            chunkIndex: 0,
            lessonId: 'lesson-123',
          },
        ],
      })

      const domainLesson = LessonMapper.toDomain(prismaLesson)

      expect(domainLesson.exercises[0].options).toBeNull()
    })

    it('preserves non-empty options array', () => {
      const prismaLesson = createPrismaLesson({
        exercises: [
          {
            id: 'exercise-1',
            type: 'multiple-choice',
            question: 'Pick one',
            answer: 'A',
            options: ['A', 'B', 'C'],
            explanation: 'A is correct',
            chunkIndex: 0,
            lessonId: 'lesson-123',
          },
        ],
      })

      const domainLesson = LessonMapper.toDomain(prismaLesson)

      expect(domainLesson.exercises[0].options).toEqual(['A', 'B', 'C'])
    })

    it('converts all difficulty levels correctly', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const

      for (const difficulty of difficulties) {
        const prismaLesson = createPrismaLesson({ difficulty })
        const domainLesson = LessonMapper.toDomain(prismaLesson)
        expect(domainLesson.difficulty.value).toBe(difficulty)
      }
    })

    it('converts all exercise types correctly', () => {
      const types = ['fill-blank', 'multiple-choice', 'translation', 'listening'] as const

      for (const type of types) {
        const prismaLesson = createPrismaLesson({
          exercises: [
            {
              id: 'ex-1',
              type,
              question: 'Test?',
              answer: 'Test',
              options: type === 'multiple-choice' ? ['Test', 'Wrong'] : [],
              explanation: 'Explanation',
              chunkIndex: 0,
              lessonId: 'lesson-123',
            },
          ],
        })

        const domainLesson = LessonMapper.toDomain(prismaLesson)
        expect(domainLesson.exercises[0].type.value).toBe(type)
      }
    })

    it('converts all partOfSpeech values correctly', () => {
      const partsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'phrase'] as const

      for (const partOfSpeech of partsOfSpeech) {
        const prismaLesson = createPrismaLesson({
          vocabulary: [
            {
              id: 'vocab-1',
              word: 'test',
              definition: 'A test word',
              example: 'This is a test.',
              partOfSpeech,
              chunkIndex: 0,
              lessonId: 'lesson-123',
            },
          ],
        })

        const domainLesson = LessonMapper.toDomain(prismaLesson)
        expect(domainLesson.vocabulary[0].partOfSpeech).toBe(partOfSpeech)
      }
    })
  })

  describe('toPrisma', () => {
    it('converts domain Lesson to Prisma format', () => {
      const domainLesson = createDomainLesson()

      const prismaData = LessonMapper.toPrisma(domainLesson)

      expect(prismaData.id).toBe('lesson-123')
      expect(prismaData.videoId).toBe('dQw4w9WgXcQ')
      expect(prismaData.title).toBe('Test Lesson')
      expect(prismaData.difficulty).toBe('medium')
      expect(prismaData.createdAt).toBeInstanceOf(Date)
    })

    it('converts null options to empty array', () => {
      const domainLesson = createDomainLesson()

      const prismaData = LessonMapper.toPrisma(domainLesson)

      // First exercise has null options (fill-blank)
      expect(prismaData.exercises[0].options).toEqual([])
    })

    it('preserves non-null options', () => {
      const domainLesson = createDomainLesson()

      const prismaData = LessonMapper.toPrisma(domainLesson)

      // Second exercise has options (multiple-choice)
      expect(prismaData.exercises[1].options).toEqual(['sad', 'happy', 'angry'])
    })

    it('converts exercises correctly', () => {
      const domainLesson = createDomainLesson()

      const prismaData = LessonMapper.toPrisma(domainLesson)

      expect(prismaData.exercises.length).toBe(2)
      expect(prismaData.exercises[0]).toEqual({
        id: 'exercise-1',
        type: 'fill-blank',
        question: 'Complete: I ___ to the store.',
        answer: 'went',
        options: [],
        explanation: 'Past tense of go',
        chunkIndex: 0,
      })
    })

    it('converts vocabulary correctly', () => {
      const domainLesson = createDomainLesson()

      const prismaData = LessonMapper.toPrisma(domainLesson)

      expect(prismaData.vocabulary.length).toBe(1)
      expect(prismaData.vocabulary[0]).toEqual({
        id: 'vocab-1',
        word: 'serendipity',
        definition: 'The occurrence of events by chance',
        example: 'Finding that book was serendipity.',
        partOfSpeech: 'noun',
        chunkIndex: 0,
      })
    })
  })
})
