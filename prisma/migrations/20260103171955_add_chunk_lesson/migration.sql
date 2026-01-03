-- CreateTable
CREATE TABLE "ChunkLesson" (
    "id" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "translation" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcriptId" TEXT NOT NULL,

    CONSTRAINT "ChunkLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChunkVocabulary" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "chunkLessonId" TEXT NOT NULL,

    CONSTRAINT "ChunkVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChunkExercise" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "chunkLessonId" TEXT NOT NULL,

    CONSTRAINT "ChunkExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChunkLesson_transcriptId_idx" ON "ChunkLesson"("transcriptId");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkLesson_transcriptId_chunkIndex_key" ON "ChunkLesson"("transcriptId", "chunkIndex");

-- CreateIndex
CREATE INDEX "ChunkVocabulary_chunkLessonId_idx" ON "ChunkVocabulary"("chunkLessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkExercise_chunkLessonId_key" ON "ChunkExercise"("chunkLessonId");

-- AddForeignKey
ALTER TABLE "ChunkLesson" ADD CONSTRAINT "ChunkLesson_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChunkVocabulary" ADD CONSTRAINT "ChunkVocabulary_chunkLessonId_fkey" FOREIGN KEY ("chunkLessonId") REFERENCES "ChunkLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChunkExercise" ADD CONSTRAINT "ChunkExercise_chunkLessonId_fkey" FOREIGN KEY ("chunkLessonId") REFERENCES "ChunkLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
