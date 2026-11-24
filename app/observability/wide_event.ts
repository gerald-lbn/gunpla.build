import type { Logger } from '@adonisjs/core/logger'

type Fields = Record<string, unknown>

type ErrorFields = {
  type: string
  message: string
  code?: string
  status?: number
  cause?: string
  stack?: string
}

/**
 * One context-rich log event per unit of work (an HTTP request, a firehose
 * message, a background sync). Code adds fields as the work runs, and the
 * owner of the unit emits the event once, when the work is done.
 */
export default class WideEvent {
  readonly name: string
  #fields: Fields
  #error: ErrorFields | null = null
  #startedAt = process.hrtime.bigint()
  #emitted = false

  constructor(name: string, fields: Fields = {}) {
    this.name = name
    this.#fields = { ...fields }
  }

  /**
   * Merge fields into the event. A plain object merges into the object
   * already stored under the same key, so two callers can each add to `kit`.
   */
  set(fields: Fields): this {
    for (const [key, value] of Object.entries(fields)) {
      const current = this.#fields[key]
      if (WideEvent.#isPlainObject(current) && WideEvent.#isPlainObject(value)) {
        this.#fields[key] = { ...current, ...value }
        continue
      }
      this.#fields[key] = value
    }
    return this
  }

  /**
   * Mark the whole unit of work as failed.
   */
  fail(error: unknown): this {
    this.#error = WideEvent.#describe(error)
    return this
  }

  /**
   * Record a step that failed without failing the unit of work, such as a
   * best-effort sync that the request carries on without.
   */
  failStep(step: string, error: unknown): this {
    return this.set({ [step]: { outcome: 'error', error: WideEvent.#describe(error) } })
  }

  /**
   * `success`, `client_error` for a failure with a 4xx status, or `error`.
   */
  get outcome(): 'success' | 'client_error' | 'error' {
    if (!this.#error) {
      return 'success'
    }
    const status = this.#error.status ?? 500
    return status < 500 ? 'client_error' : 'error'
  }

  get durationMs(): number {
    return Number(process.hrtime.bigint() - this.#startedAt) / 1e6
  }

  toJSON(): Fields {
    return {
      event: this.name,
      ...this.#fields,
      outcome: this.outcome,
      duration_ms: Math.round(this.durationMs * 100) / 100,
      ...(this.#error ? { error: this.#error } : {}),
    }
  }

  /**
   * Write the event once. Later calls do nothing, so a `finally` block and a
   * cleanup path can both emit without writing two lines.
   */
  emit(logger: Logger): void {
    if (this.#emitted) {
      return
    }
    this.#emitted = true

    if (this.outcome === 'error') {
      logger.error(this.toJSON(), this.name)
      return
    }
    logger.info(this.toJSON(), this.name)
  }

  static #describe(error: unknown): ErrorFields {
    if (!(error instanceof Error)) {
      return { type: typeof error, message: String(error) }
    }

    const { code, status } = error as Error & { code?: unknown; status?: unknown }
    const described: ErrorFields = {
      type: error.name === 'Error' ? error.constructor.name : error.name,
      message: error.message,
    }
    if (typeof code === 'string') described.code = code
    if (typeof status === 'number') described.status = status
    if (error.cause !== undefined) {
      described.cause = error.cause instanceof Error ? error.cause.message : String(error.cause)
    }
    if ((described.status ?? 500) >= 500) described.stack = error.stack
    return described
  }

  static #isPlainObject(value: unknown): value is Fields {
    return typeof value === 'object' && value !== null && value.constructor === Object
  }
}
