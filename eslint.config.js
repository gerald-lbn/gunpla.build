import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default [
  { ignores: ['app/lexicons/build/**', 'database/schema.ts'] },
  ...configApp(...react),
]
