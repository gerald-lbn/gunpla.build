import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default [
  { ignores: ['app/lexicons/build/**', 'database/schema.ts'] },
  ...configApp(...react),
  {
    files: ['inertia/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      // Prettier owns line wrapping; the two fight over long class strings
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // hooks for third-party and plain CSS, not Tailwind classes: sonner's root, section.tsx's BEM names
      'better-tailwindcss/no-unknown-classes': [
        'error',
        { ignore: ['^toaster$', '^section(__[a-z]+)?$'] },
      ],
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'inertia/css/app.css',
        tsconfig: 'inertia/tsconfig.json',
        // classes defined in app.css itself (.sticker, .display, .column, .cut-*, .num)
        detectComponentClasses: true,
      },
    },
  },
]
