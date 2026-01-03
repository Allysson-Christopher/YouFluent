'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { useLessonStore } from '../stores/lesson-store'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'

/**
 * VocabularyList Component
 *
 * Displays all vocabulary items from the current lesson:
 * - Word and part of speech
 * - Definition
 * - Example sentence
 *
 * Clicking an item seeks the video to the corresponding chunk.
 *
 * Uses Zustand stores for state management:
 * - useLessonStore for lesson/vocabulary data
 * - usePlayerStore for video seeking
 */
export function VocabularyList() {
  const lesson = useLessonStore((s) => s.lesson)
  const seekToChunk = usePlayerStore((s) => s.seekToChunk)

  if (!lesson || lesson.vocabularyCount === 0) {
    return null
  }

  return (
    <Card data-testid="vocabulary-list">
      <CardHeader>
        <CardTitle className="text-base" data-testid="vocabulary-header">
          Vocabulary ({lesson.vocabularyCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {lesson.vocabulary.map((item, index) => (
            <li
              key={item.id}
              className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => seekToChunk(item.chunkIndex)}
              data-testid={`vocab-${index}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold" data-testid={`vocab-${index}-word`}>
                  {item.word}
                </span>
                <span
                  className="text-xs text-muted-foreground italic"
                  data-testid={`vocab-${index}-pos`}
                >
                  {item.partOfSpeech}
                </span>
              </div>
              <p
                className="text-sm text-muted-foreground mt-1"
                data-testid={`vocab-${index}-definition`}
              >
                {item.definition}
              </p>
              <p className="text-sm italic mt-1" data-testid={`vocab-${index}-example`}>
                &quot;{item.example}&quot;
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
