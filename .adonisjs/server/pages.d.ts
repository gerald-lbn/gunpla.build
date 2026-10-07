import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'explore/index': ExtractProps<(typeof import('../../inertia/pages/explore/index.tsx'))['default']>
    'explore/kit_detail': ExtractProps<(typeof import('../../inertia/pages/explore/kit_detail.tsx'))['default']>
    'home/activity_ticker': ExtractProps<(typeof import('../../inertia/pages/home/activity_ticker.tsx'))['default']>
    'home/hero': ExtractProps<(typeof import('../../inertia/pages/home/hero.tsx'))['default']>
    'home/index': ExtractProps<(typeof import('../../inertia/pages/home/index.tsx'))['default']>
    'home/kit_feed_card': ExtractProps<(typeof import('../../inertia/pages/home/kit_feed_card.tsx'))['default']>
    'home/live_feed': ExtractProps<(typeof import('../../inertia/pages/home/live_feed.tsx'))['default']>
    'kits/edit': ExtractProps<(typeof import('../../inertia/pages/kits/edit.tsx'))['default']>
    'kits/new': ExtractProps<(typeof import('../../inertia/pages/kits/new.tsx'))['default']>
    'profile': ExtractProps<(typeof import('../../inertia/pages/profile.tsx'))['default']>
    'stats': ExtractProps<(typeof import('../../inertia/pages/stats.tsx'))['default']>
  }
}
