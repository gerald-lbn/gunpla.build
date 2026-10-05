import { Input } from '~/components/ui/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '~/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date_picker'

export const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

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

export function KitFormFields({ values, onChange, errors }: KitFormFieldsProps) {
  return (
    <>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">
          Name <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Hi-Nu Gundam"
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
          placeholder="HG, RG, MG, PG, MGSD…"
          value={values.grade}
          onChange={(e) => onChange('grade', e.target.value)}
          aria-invalid={errors.grade ? 'true' : undefined}
        />
        <FieldError>{errors.grade}</FieldError>
      </Field>

      <Field data-invalid={!!errors.scale}>
        <FieldLabel htmlFor="scale">Scale</FieldLabel>
        <Input
          id="scale"
          name="scale"
          type="text"
          placeholder="1/144, 1/100…"
          value={values.scale}
          onChange={(e) => onChange('scale', e.target.value)}
          aria-invalid={errors.scale ? 'true' : undefined}
        />
        <FieldError>{errors.scale}</FieldError>
      </Field>

      <Field data-invalid={!!errors.manufacturer}>
        <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
        <Input
          id="manufacturer"
          name="manufacturer"
          type="text"
          placeholder="Bandai, SNAA…"
          value={values.manufacturer}
          onChange={(e) => onChange('manufacturer', e.target.value)}
          aria-invalid={errors.manufacturer ? 'true' : undefined}
        />
        <FieldError>{errors.manufacturer}</FieldError>
      </Field>

      <Field data-invalid={!!errors.acquiredAt}>
        <FieldLabel htmlFor="acquiredAt">Acquired date</FieldLabel>
        <DatePicker
          id="acquiredAt"
          name="acquiredAt"
          value={values.acquiredAt}
          onChange={(v) => onChange('acquiredAt', v)}
          placeholder="Pick a date"
          aria-invalid={errors.acquiredAt ? 'true' : undefined}
        />
        <FieldError>{errors.acquiredAt}</FieldError>
        <FieldDescription>When you bought or received this kit.</FieldDescription>
      </Field>

      <Field data-invalid={!!errors.status}>
        <FieldLabel htmlFor="status">
          Status <span className="text-destructive">*</span>
        </FieldLabel>
        <Select
          value={values.status}
          onValueChange={(v) => v && onChange('status', v)}
          name="status"
        >
          <SelectTrigger
            id="status"
            className="w-full"
            aria-invalid={errors.status ? 'true' : undefined}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.status}</FieldError>
      </Field>
    </>
  )
}
