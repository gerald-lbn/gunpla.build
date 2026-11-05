import { cn } from 'cn'
import { STATUS_STICKER } from '~/components/stickers'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '~/components/ui/field'
import { DatePicker } from '~/components/ui/date_picker'
import { statusLabel } from '~/lib/kits'

export const STATUSES = ['backlog', 'in-progress', 'done', 'on-hold', 'dropped'] as const

const STATUS_HINT: Record<(typeof STATUSES)[number], string> = {
  'backlog': 'Still boxed',
  'in-progress': 'On the bench',
  'done': 'Finished',
  'on-hold': 'Paused',
  'dropped': 'Abandoned',
}

export type KitFormValues = {
  name: string
  grade: string
  scale: string
  manufacturer: string
  acquiredAt: string
  status: string
}

interface KitFormFieldsProps {
  values: KitFormValues
  onChange: (field: keyof KitFormValues, value: string) => void
  errors: Partial<Record<string, string | undefined>>
}

/** What is printed on the box: name, grade, scale, maker, and when it arrived. */
export function KitDetailsFields({ values, onChange, errors }: KitFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field data-invalid={!!errors.name} className="sm:col-span-2">
        <FieldLabel htmlFor="name">Kit name</FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="RX-78-2 Gundam Ver. 3.0"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          aria-invalid={errors.name ? 'true' : undefined}
          required
        />
        <FieldError>{errors.name}</FieldError>
      </Field>

      <Field data-invalid={!!errors.grade}>
        <FieldLabel htmlFor="grade">Grade</FieldLabel>
        <Input
          id="grade"
          name="grade"
          type="text"
          list="grade-options"
          placeholder="HG, RG, MG, PG, MGSD…"
          value={values.grade}
          onChange={(e) => onChange('grade', e.target.value)}
          aria-invalid={errors.grade ? 'true' : undefined}
        />
        <datalist id="grade-options">
          {['EG', 'HG', 'RG', 'MG', 'PG', 'SD', 'MGSD', 'FM', 'MGEX', 'PG Unleashed', 'RE/100'].map(
            (g) => (
              <option key={g} value={g} />
            )
          )}
        </datalist>
        <FieldError>{errors.grade}</FieldError>
      </Field>

      <Field data-invalid={!!errors.scale}>
        <FieldLabel htmlFor="scale">Scale</FieldLabel>
        <Input
          id="scale"
          name="scale"
          type="text"
          list="scale-options"
          placeholder="1/144, 1/100, 1/60"
          value={values.scale}
          onChange={(e) => onChange('scale', e.target.value)}
          aria-invalid={errors.scale ? 'true' : undefined}
        />
        <datalist id="scale-options">
          {['1/144', '1/100', '1/60', 'Non-scale'].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <FieldError>{errors.scale}</FieldError>
      </Field>

      <Field data-invalid={!!errors.manufacturer}>
        <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
        <Input
          id="manufacturer"
          name="manufacturer"
          type="text"
          placeholder="Bandai, Kotobukiya, SNAA…"
          value={values.manufacturer}
          onChange={(e) => onChange('manufacturer', e.target.value)}
          aria-invalid={errors.manufacturer ? 'true' : undefined}
        />
        <FieldError>{errors.manufacturer}</FieldError>
      </Field>

      <Field data-invalid={!!errors.acquiredAt}>
        <FieldLabel htmlFor="acquiredAt">Acquired on</FieldLabel>
        <DatePicker
          id="acquiredAt"
          name="acquiredAt"
          value={values.acquiredAt}
          onChange={(v) => onChange('acquiredAt', v)}
          placeholder="The day it arrived"
          aria-invalid={errors.acquiredAt ? 'true' : undefined}
        />
        <FieldError>{errors.acquiredAt}</FieldError>
      </Field>
    </div>
  )
}

/**
 * Where the kit is in the build, as five segments backed by native radios so the
 * value posts with the form and arrow keys move between them.
 */
export function KitStatusField({ values, onChange, errors }: KitFormFieldsProps) {
  return (
    <Field data-invalid={!!errors.status}>
      <fieldset>
        <legend className="sr-only">Build status</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STATUSES.map((s) => {
            const checked = values.status === s
            return (
              <label
                key={s}
                className={cn(
                  'relative flex min-h-16 cursor-pointer flex-col justify-center rounded-[28px] px-5 py-3 transition-[background-color,transform] active:scale-[0.97]',
                  'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
                  checked ? cn(STATUS_STICKER[s], 'text-on-colour') : 'bg-surface hover:bg-hover',
                  s === 'dropped' && 'col-span-2 sm:col-span-1'
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={checked}
                  onChange={() => onChange('status', s)}
                  className="sr-only"
                />
                <span className="text-[17px] font-bold">{statusLabel(s)}</span>
                <span className="text-sm/snug">{STATUS_HINT[s]}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <FieldError>{errors.status}</FieldError>
      <FieldDescription>
        Built kits count toward your grade ladder and appear in Explore.
      </FieldDescription>
    </Field>
  )
}
