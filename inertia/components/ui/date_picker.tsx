import { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DatePickerProps {
  'id'?: string
  'name'?: string
  'value'?: string
  'onChange'?: (value: string) => void
  'placeholder'?: string
  'disabled'?: boolean
  'aria-invalid'?: 'true' | undefined
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date ? format(date, 'yyyy-MM-dd') : '')
    if (date) setOpen(false)
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={ariaInvalid}
              data-empty={!selected}
              className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground"
            />
          }
        >
          <CalendarIcon />
          {selected ? format(selected, 'PP') : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
