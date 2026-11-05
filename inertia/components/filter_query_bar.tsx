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
  return <ul className="max-h-64 overflow-y-auto">{children}</ul>
}

function DropdownItem({ onSelect, children }: { onSelect: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSelect}
        className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-[15px] hover:bg-hover"
      >
        {children}
      </button>
    </li>
  )
}

function DropdownEmpty({ children }: { children: React.ReactNode }) {
  return <p className="px-2.5 py-2 text-sm text-muted-foreground">{children}</p>
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
          className="flex min-h-12 cursor-text flex-wrap items-center gap-1.5 rounded-[24px] bg-surface py-1.5 pr-1.5 pl-4 transition-colors focus-within:bg-hover hover:bg-hover"
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

          {selectedType && <span className="sticker bg-raised">{selectedType.label}</span>}

          <div className="flex flex-1 items-center gap-2">
            {chips.length === 0 && !selectedType && (
              <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
            )}
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
                  ? 'Search or filter by grade, scale, builder…'
                  : selectedType
                    ? `Search ${selectedType.label.toLowerCase()}…`
                    : ''
              }
              aria-label="Filter builds"
              className="h-9 min-w-40 flex-1 bg-transparent text-[16px] outline-none placeholder:text-faint"
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
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-4 text-[15px] font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-primary-hover active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="w-64 p-1.5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {selectedType ? (
          selectedType.key === 'builder' && inputValue.length < 2 ? (
            <DropdownEmpty>Type at least 2 characters of a handle</DropdownEmpty>
          ) : activeSuggestions.length === 0 ? (
            <DropdownEmpty>No logged kit uses that value yet</DropdownEmpty>
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
                <div className="h-1" />
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
      className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-raised hover:text-foreground"
      aria-label={`Remove ${typeLabel ?? 'search'} filter`}
    >
      <X className="size-3" />
    </button>
  )

  if (!chip.type) {
    return (
      <Badge variant="default" className="h-6 gap-1 pr-1">
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
          className="h-6 cursor-pointer gap-1 pr-1 hover:bg-secondary-hover"
          onClick={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          aria-label={`Edit ${typeLabel} filter: ${chip.value}`}
        >
          <span className="text-muted-foreground">{typeLabel}</span>
          <span>{chip.value}</span>
          {removeBtn}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start">
        <div className="mb-1 px-2.5 pb-1.5">
          <input
            value={editQuery}
            onChange={(e) => setEditQuery(e.target.value)}
            placeholder={`Search ${typeLabel?.toLowerCase()}…`}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-faint"
            autoFocus
          />
        </div>
        {chip.type === 'builder' && editQuery.length < 2 ? (
          <DropdownEmpty>Type at least 2 characters of a handle</DropdownEmpty>
        ) : activeEditSuggestions.length === 0 ? (
          <DropdownEmpty>No logged kit uses that value yet</DropdownEmpty>
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
