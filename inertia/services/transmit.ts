import { Transmit } from '@adonisjs/transmit-client'

export const transmit = new Transmit({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
})
