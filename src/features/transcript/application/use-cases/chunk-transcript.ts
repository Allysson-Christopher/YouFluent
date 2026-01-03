import { Chunk, type RawTranscriptSegment } from '../../domain'

/**
 * ChunkTranscriptUseCase
 *
 * Divides raw transcript segments into chunks of approximately
 * targetDuration seconds (default: 30s).
 *
 * PRE: segments is an array of RawTranscriptSegment (can be empty)
 * POST: Returns array of Chunk entities with sequential indexes
 */
export class ChunkTranscriptUseCase {
  private static readonly DEFAULT_TARGET_DURATION = 10 // seconds (matches original Python version)

  /**
   * Execute chunking algorithm
   *
   * @param segments - Raw transcript segments from YouTube
   * @param targetDuration - Target duration per chunk in seconds (default: 30)
   * @returns Array of Chunk entities
   */
  execute(
    segments: RawTranscriptSegment[],
    targetDuration: number = ChunkTranscriptUseCase.DEFAULT_TARGET_DURATION
  ): Chunk[] {
    if (segments.length === 0) {
      return []
    }

    const chunks: Chunk[] = []
    let currentTexts: string[] = []
    let currentStartTime = segments[0].start
    let currentEndTime = segments[0].start
    let chunkIndex = 0

    for (const segment of segments) {
      const segmentEndTime = segment.start + segment.duration
      const currentDuration = segmentEndTime - currentStartTime

      // If adding this segment exceeds target, finalize current chunk
      if (currentDuration > targetDuration && currentTexts.length > 0) {
        const chunk = this.createChunk(
          chunkIndex,
          currentStartTime,
          currentEndTime,
          currentTexts
        )
        chunks.push(chunk)

        // Start new chunk
        chunkIndex++
        currentTexts = [segment.text]
        currentStartTime = segment.start
        currentEndTime = segmentEndTime
      } else {
        // Add to current chunk
        currentTexts.push(segment.text)
        currentEndTime = segmentEndTime
      }
    }

    // Finalize last chunk if has content
    if (currentTexts.length > 0) {
      const chunk = this.createChunk(
        chunkIndex,
        currentStartTime,
        currentEndTime,
        currentTexts
      )
      chunks.push(chunk)
    }

    return chunks
  }

  private createChunk(
    index: number,
    startTime: number,
    endTime: number,
    texts: string[]
  ): Chunk {
    const result = Chunk.create({
      id: crypto.randomUUID(),
      index,
      startTime,
      endTime,
      text: texts.join(' '),
    })

    // CRITICAL: Chunk.create() can fail, but with our data it should not
    if (result.isFailure) {
      throw new Error(`Failed to create chunk: ${result.error.message}`)
    }

    return result.value
  }
}
