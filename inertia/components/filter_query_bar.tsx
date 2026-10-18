import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Search, ChevronRight } from 'lucide-react'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Badge } from '~/components/ui/badge'

export type FilterType = {
  key: 'grade' | 'scale' | 'manufacturer' | 'builder'
  label: string
}

export type FilterChip = {
  type: FilterType['key'] | null
  value: string
}

interface FilterQueryBarProps {
  filterTypes: FilterType[]
  chips: FilterChip[]
  onChipsChange: (chips: FilterChip[]) => void
  onSubmit?: () => void
  valueFetcher: (type: string, q?: string) => Promise<string[]>
}

function DropdownList({ children }: { children: React.ReactNode }) {
  return <ul className="max-h-52 overflow-y-auto py-1">{children}</ul>
}

function DropdownItem({ onSelect, children }: { onSelect: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSelect}
        className="flex w-full items-center gap-2 px-3 py-1.5 font-head text-sm hover:bg-accent hover:text-accent-foreground"
      >
        {children}
      </button>
    </li>
  )
}

function DropdownEmpty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-2 font-head text-sm text-muted-foreground">{children}</p>
}

export function FilterQueryBar({
  filterTypes,
  chips,
  onChipsChange,
  onSubmit,
  valueFetcher,
}: FilterQueryBarProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedType, setSelectedType] = useState<FilterType | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const usedTypeKeys = chips.map((c) => c.type).filter(Boolean) as FilterType['key'][]
  const availableTypes = filterTypes.filter((t) => !usedTypeKeys.includes(t.key))
  const filteredTypes = inputValue
    ? availableTypes.filter((t) => t.label.toLowerCase().includes(inputValue.toLowerCase()))
    : availableTypes

  useEffect(() => {
    if (!selectedType) return
    if (selectedType.key === 'builder' && inputValue.length < 2) return
    const q = selectedType.key === 'builder' ? inputValue : undefined
    let cancelled = false
    valueFetcher(selectedType.key, q).then((vals) => {
      if (!cancelled) setSuggestions(vals)
    })
    return () => {
      cancelled = true
    }
  }, [selectedType, inputValue, valueFetcher])

  const activeSuggestions =
    !selectedType || (selectedType.key === 'builder' && inputValue.length < 2) ? [] : suggestions

  const addChip = useCallback(
    (type: FilterType['key'] | null, value: string) => {
      if (!value.trim()) return
      onChipsChange([...chips, { type, value: value.trim() }])
      setSelectedType(null)
      setInputValue('')
      setOpen(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [chips, onChipsChange]
  )

  const removeChip = (index: number) => {
    onChipsChange(chips.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue === '') {
      if (selectedType) {
        setSelectedType(null)
      } else if (chips.length > 0) {
        onChipsChange(chips.slice(0, -1))
      }
    } else if (e.key === 'Escape') {
      if (selectedType) {
        setSelectedType(null)
        setInputValue('')
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
    } else if (e.key === 'Enter' && inputValue.trim() && !selectedType) {
      addChip(null, inputValue)
    }
  }

  const showDropdown = open && (filteredTypes.length > 0 || !!inputValue.trim() || !!selectedType)

  return (
    <Popover
      open={showDropdown}
      onOpenChange={(v) => {
        if (!v) {
          setOpen(false)
          setSelectedType(null)
          setInputValue('')
        }
      }}
    >
      <PopoverAnchor asChild>
        <div
          className="flex min-h-10 flex-wrap items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 shadow transition-shadow cursor-text"
          onClick={() => {
            inputRef.current?.focus()
            setOpen(true)
          }}
        >
          {chips.map((chip, i) => (
            <ChipBadge
              key={i}
              chip={chip}
              filterTypes={filterTypes}
              onRemove={() => removeChip(i)}
              valueFetcher={valueFetcher}
              onUpdate={(value) =>
                onChipsChange(chips.map((c, idx) => (idx === i ? { ...c, value } : c)))
              }
            />
          ))}

          {selectedType && (
            <span className="border border-border bg-primary px-1.5 py-0.5 font-head text-xs font-semibold text-primary-foreground shadow-xs">
              {selectedType.label}:
            </span>
          )}

          <div className="flex flex-1 items-center gap-1">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (!open) setOpen(true)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
              placeholder={
                chips.length === 0 && !selectedType
                  ? 'Filter by grade, scale, manufacturer, or builder…'
                  : selectedType
                    ? `Search ${selectedType.label.toLowerCase()}…`
                    : ''
              }
              className="min-w-40 flex-1 bg-transparent font-head text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              aria-label="Submit search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation()
                if (inputValue.trim()) {
                  addChip(selectedType ? selectedType.key : null, inputValue)
                } else {
                  onSubmit?.()
                }
              }}
              className="shrink-0 border-2 border-border bg-primary p-1 shadow-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Search className="size-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="w-56 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {selectedType ? (
          selectedType.key === 'builder' && inputValue.length < 2 ? (
            <DropdownEmpty>Type 2+ characters to search builders</DropdownEmpty>
          ) : activeSuggestions.length === 0 ? (
            <DropdownEmpty>No matching values</DropdownEmpty>
          ) : (
            <DropdownList>
              {activeSuggestions.map((v) => (
                <DropdownItem key={v} onSelect={() => addChip(selectedType.key, v)}>
                  {v}
                </DropdownItem>
              ))}
            </DropdownList>
          )
        ) : (
          <>
            <DropdownList>
              {filteredTypes.map((type) => (
                <DropdownItem
                  key={type.key}
                  onSelect={() => {
                    setSelectedType(type)
                    setInputValue('')
                  }}
                >
                  {type.label}
                  <ChevronRight className="ml-auto size-3 text-muted-foreground" />
                </DropdownItem>
              ))}
            </DropdownList>
            {inputValue.trim() && (
              <>
                <div className="border-t-2 border-border" />
                <DropdownList>
                  <DropdownItem onSelect={() => addChip(null, inputValue)}>
                    <Search className="size-3 text-muted-foreground" />
                    Search &ldquo;{inputValue}&rdquo;
                  </DropdownItem>
                </DropdownList>
              </>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface ChipBadgeProps {
  chip: FilterChip
  filterTypes: FilterType[]
  onRemove: () => void
  valueFetcher: (type: string, q?: string) => Promise<string[]>
  onUpdate: (value: string) => void
}

function ChipBadge({ chip, filterTypes, onRemove, valueFetcher, onUpdate }: ChipBadgeProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [editQuery, setEditQuery] = useState('')
  const [editSuggestions, setEditSuggestions] = useState<string[]>([])

  const typeLabel = chip.type ? filterTypes.find((t) => t.key === chip.type)?.label : null

  useEffect(() => {
    if (!editOpen || !chip.type) return
    if (chip.type === 'builder' && editQuery.length < 2) return
    const q = chip.type === 'builder' ? editQuery : undefined
    let cancelled = false
    valueFetcher(chip.type, q).then((vals) => {
      if (!cancelled) setEditSuggestions(vals)
    })
    return () => {
      cancelled = true
    }
  }, [editOpen, chip.type, editQuery, valueFetcher])

  const activeEditSuggestions =
    chip.type === 'builder' && editQuery.length < 2 ? [] : editSuggestions

  const removeBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
      className="ml-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none"
      aria-label={`Remove ${typeLabel ?? 'search'} filter`}
    >
      <X className="size-3" />
    </button>
  )

  if (!chip.type) {
    return (
      <Badge variant="outline" className="h-6 gap-1 pr-0.5">
        <Search className="size-3 text-muted-foreground" aria-hidden="true" />
        <span>{chip.value}</span>
        {removeBtn}
      </Badge>
    )
  }

  return (
    <Popover open={editOpen} onOpenChange={setEditOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="default"
          className="h-6 cursor-pointer gap-1 pr-0.5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          onClick={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          aria-label={`Edit ${typeLabel} filter: ${chip.value}`}
        >
          <span className="opacity-70">{typeLabel}:</span>
          <span>{chip.value}</span>
          {removeBtn}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="border-b-2 border-border px-3 py-1.5">
          <input
            value={editQuery}
            onChange={(e) => setEditQuery(e.target.value)}
            placeholder={`Search ${typeLabel?.toLowerCase()}…`}
            className="w-full bg-transparent font-head text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        {chip.type === 'builder' && editQuery.length < 2 ? (
          <DropdownEmpty>Type 2+ characters</DropdownEmpty>
        ) : activeEditSuggestions.length === 0 ? (
          <DropdownEmpty>No values found</DropdownEmpty>
        ) : (
          <DropdownList>
            {activeEditSuggestions.map((v) => (
              <DropdownItem
                key={v}
                onSelect={() => {
                  onUpdate(v)
                  setEditOpen(false)
                }}
              >
                {v}
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </PopoverContent>
    </Popover>
  )
}
