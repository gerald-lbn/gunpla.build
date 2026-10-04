import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { spawn } from 'node:child_process'

export default class LexiconsExport extends BaseCommand {
  static commandName = 'lexicons:build'
  static description = 'Regenerate app/lexicons from JSON lexicon definitions'

  static options: CommandOptions = {}

  async run() {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        'pnpm',
        ['exec', 'lex', 'build', '--clear', '--lexicons', './lexicons', '--out', './app/lexicons'],
        { stdio: 'inherit' }
      )
      proc.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`lex build exited ${code}`))
      )
    })
    this.logger.success('app/lexicons regenerated')
  }
}
