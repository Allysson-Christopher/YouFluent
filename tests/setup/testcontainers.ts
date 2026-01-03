import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let container: StartedPostgreSqlContainer | null = null
let prisma: PrismaClient | null = null
let pool: Pool | null = null

/**
 * Start PostgreSQL container and initialize Prisma client
 * Use this in beforeAll hook for integration tests
 */
export async function setupTestDatabase() {
  // Start PostgreSQL container
  container = await new PostgreSqlContainer('postgres:16')
    .withDatabase('youfluent_test')
    .withUsername('test')
    .withPassword('test')
    .start()

  // Create connection pool
  pool = new Pool({
    connectionString: container.getConnectionUri(),
  })

  // Create Prisma client with pg adapter
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })

  return { prisma, container, connectionString: container.getConnectionUri() }
}

/**
 * Cleanup database and stop container
 * Use this in afterAll hook for integration tests
 */
export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }

  if (pool) {
    await pool.end()
    pool = null
  }

  if (container) {
    await container.stop()
    container = null
  }
}

/**
 * Get the current Prisma client instance
 * Throws if not initialized
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.')
  }
  return prisma
}

/**
 * Clean all tables between tests
 * Use this in beforeEach hook
 */
export async function cleanDatabase() {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.')
  }

  // Get all table names (excluding system tables)
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `

  // Truncate all tables
  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`)
  }
}
