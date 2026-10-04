import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

mkdirSync('tmp', { recursive: true })

if (process.env.MIGRATE === 'true') {
  console.log('Running migrations...')
  execSync('node ace migration:run --force', { stdio: 'inherit' })
}

await import('./bin/server.js')
