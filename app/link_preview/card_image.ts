import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import satori, { type Font } from 'satori'
import sharp from 'sharp'
import linkPreviewConfig from '#config/link_preview'

type Style = Record<string, string | number>

type Child = CardNode | string | null | false

export type CardNode = {
  type: string
  props: {
    style?: Style
    src?: string
    width?: number
    height?: number
    children?: Child | Child[]
  }
}

export default class CardImage {
  static readonly width = linkPreviewConfig.cards.width
  static readonly height = linkPreviewConfig.cards.height

  static readonly colours = {
    vfin: '#ffc927',
    fedBlue: '#2ea3ff',
    shield: '#ff5c4a',
    runner: '#dfe2e6',
    ink: '#0b0b0c',
    paper: '#ffffff',
  }

  static readonly fonts = {
    display: 'Archivo Display',
    text: 'Archivo',
  }

  static #fonts: Promise<Font[]> | null = null

  readonly root: CardNode

  constructor(root: CardNode) {
    this.root = root
  }

  async toSvg(): Promise<string> {
    return satori(this.root as unknown as Parameters<typeof satori>[0], {
      width: CardImage.width,
      height: CardImage.height,
      fonts: await CardImage.#loadFonts(),
    })
  }

  async toJpeg(): Promise<Buffer> {
    return sharp(Buffer.from(await this.toSvg()))
      .jpeg({ quality: linkPreviewConfig.cards.jpegQuality, chromaSubsampling: '4:4:4' })
      .toBuffer()
  }

  static box(style: Style, children?: Child | Child[]): CardNode {
    return { type: 'div', props: { style: { display: 'flex', ...style }, children } }
  }

  static image(src: string, style: Style): CardNode {
    return { type: 'img', props: { src, style } }
  }

  static wordmark(size: number, ground: string = CardImage.colours.paper): CardNode {
    const { vfin, fedBlue, shield, runner, ink, paper } = CardImage.colours
    const blocks: [string, string, string][] = [
      ['g', vfin, ink],
      ['u', fedBlue, ink],
      ['n', shield, ink],
      ['p', runner, ink],
      ['l', ink, paper],
      ['a', vfin, ink],
      ['.', fedBlue, ink],
      ['b', shield, ink],
      ['u', runner, ink],
      ['i', ink, paper],
      ['l', vfin, ink],
      ['d', fedBlue, ink],
    ]
    return CardImage.box(
      { gap: Math.round(size * 0.08) },
      blocks.map(([letter, background, color]) =>
        CardImage.box(
          {
            width: Math.round(size * 0.62),
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Math.round(size * 0.16),
            background: background === ground ? paper : background,
            color,
            fontFamily: CardImage.fonts.display,
            fontSize: Math.round(size * 0.82),
            textTransform: 'uppercase',
          },
          letter
        )
      )
    )
  }

  static #loadFonts(): Promise<Font[]> {
    CardImage.#fonts ??= Promise.all([
      readFile(app.makePath('resources/fonts/Archivo-ExtraBold-Condensed62.ttf')),
      readFile(app.makePath('resources/fonts/Archivo-SemiBold.ttf')),
      readFile(app.makePath('resources/fonts/Archivo-ExtraBold.ttf')),
    ]).then(([display, semiBold, extraBold]) => [
      { name: CardImage.fonts.display, data: display, weight: 800, style: 'normal' },
      { name: CardImage.fonts.text, data: semiBold, weight: 600, style: 'normal' },
      { name: CardImage.fonts.text, data: extraBold, weight: 800, style: 'normal' },
    ])
    return CardImage.#fonts
  }
}
