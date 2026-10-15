import { useState, useEffect } from 'react'
import { ExploreCard } from '~/components/explore_card'
import type { InferVariants } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitExplore = InferVariants<KitTransformer>['forExplore']

interface ExploreMasonryGridProps {
  kits: KitExplore[]
  onSelect: (kit: KitExplore) => void
}

function useColumnCount(): number {
  const [count, setCount] = useState(1)

  useEffect(() => {
    function update() {
      if (window.innerWidth >= 1024) setCount(3)
      else if (window.innerWidth >= 640) setCount(2)
      else setCount(1)
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
    <div className="flex gap-6">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-1 flex-col">
          {col.map((kit) => (
            <ExploreCard key={kit.id} kit={kit} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  )
}
