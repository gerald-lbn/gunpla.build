import { useState, useEffect } from 'react'
import { ExploreCard } from '~/components/explore_card'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitExplore = InferVariants<KitTransformer>['forExplore']

interface ExploreMasonryGridProps {
  kits: KitExplore[]
  onSelect: (kit: KitExplore) => void
}

function columnsFor(width: number): number {
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

function useColumnCount(): number {
  const [count, setCount] = useState(() =>
    typeof window === 'undefined' ? 3 : columnsFor(window.innerWidth)
  )

  useEffect(() => {
    function update() {
      setCount(columnsFor(window.innerWidth))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

export function ExploreMasonryGrid({ kits, onSelect }: ExploreMasonryGridProps) {
  const numCols = useColumnCount()

  const columns: KitExplore[][] = Array.from({ length: numCols }, () => [])
  kits.forEach((kit, i) => {
    columns[i % numCols].push(kit)
  })

  return (
    <div className="flex gap-2 md:gap-4">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex min-w-0 flex-1 flex-col gap-8">
          {col.map((kit) => (
            <ExploreCard key={kit.id} kit={kit} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  )
}
