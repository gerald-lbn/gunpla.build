import type { CSSProperties } from 'react'
import { cn } from 'cn'

export function OnAirSticker({
  isLive,
  isUpdating,
  className,
  style,
}: {
  isLive: boolean
  isUpdating: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={cn(
        'sticker slap gap-2.5 font-extrabold',
        isLive ? 'bg-[#0b0b0c]' : 'bg-runner',
        className
      )}
      style={style}
    >
      <span
        aria-hidden="true"
        className={cn('size-3 rounded-full', isLive ? 'on-air bg-shield' : 'bg-on-colour/40')}
      />
      <span className={isLive ? 'text-white' : 'text-on-colour'}>
        {isLive ? (isUpdating ? 'Incoming' : 'Live') : 'Offline'}
      </span>
    </span>
  )
}
