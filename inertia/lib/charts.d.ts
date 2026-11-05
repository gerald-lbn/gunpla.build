/**
 * Types for the vendored charts.js, which attaches `Charts` to `window` when imported.
 */
type ChartFormat = (value: number) => string

type ChartAnnotation = { at: number; label: string; short?: string }

export interface ChartsApi {
  bars(
    el: HTMLElement,
    options: {
      labels: string[]
      values: number[]
      format?: ChartFormat
      tickFormat?: ChartFormat
      height?: number | (() => number)
      highlight?: number | number[] | null
      dim?: number[]
      annotations?: ChartAnnotation[]
      xAt?: number[]
    }
  ): void
  line(
    el: HTMLElement,
    options: {
      labels: string[]
      series: { name: string; values: (number | null)[]; colour?: string }[]
      format?: ChartFormat
      tickFormat?: ChartFormat
      height?: number | (() => number)
      step?: boolean
      endLabel?: boolean
      annotations?: ChartAnnotation[]
      xAt?: number[]
    }
  ): { legend?: HTMLElement }
  barList(
    el: HTMLElement,
    rows: { label: string; value: number }[],
    options?: { format?: ChartFormat; colour?: string; thin?: boolean }
  ): void
  fmt: {
    int: ChartFormat
    compact: ChartFormat
  }
}

declare global {
  interface Window {
    Charts: ChartsApi
  }
}
