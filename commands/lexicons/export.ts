import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildGunplaKit } from '#lexicons/build.gunpla.kit'
import { buildGunplaBuildLog } from '#lexicons/build.gunpla.buildLog'

const LEXICONS = [buildGunplaKit, buildGunplaBuildLog]
const OUT_DIR = 'lexicons'

export default class LexiconsExport extends BaseCommand {
  static commandName = 'lexicons:export'
  static description = 'Export ATProto lexicons to JSON files'

  static options: CommandOptions = {}

  async run() {
    await mkdir(OUT_DIR, { recursive: true })

    for (const lexicon of LEXICONS) {
      const { id } = lexicon.json
      const path = join(OUT_DIR, `${id}.json`)
      await writeFile(path, JSON.stringify(lexicon.json, null, 2) + '\n')
      this.logger.success(`wrote ${path}`)
    }
  }
}
