import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load .env.local for local development
dotenv.config({ path: path.join(__dirname, '.env.local') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
