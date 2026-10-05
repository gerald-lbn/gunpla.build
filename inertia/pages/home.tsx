import { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage, router } from '@inertiajs/react'
import { transmit } from '~/services/transmit'
import BaseLayout from '~/layouts/base'
import KitCard from '~/components/kit_card'
import { Button } from '~/components/ui/button'
import { cn } from 'cn'
import {
  ArrowRight,
  Rss,
  Check,
  Database,
  Layers,
  Camera,
  Trophy,
  Zap,
  Sparkles,
  Code,
  Shield,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>
type PageProps = InertiaProps<{ kits: KitRow[] }>

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const MARQUEE_ITEMS = [
  '100% ATProto Native',
  'Zero Vendor Lock-in',
  'Real-Time Jetstream Firehose',
  'High-Res Photo Timelines',
  'All Grades HG · RG · MG · PG · SD',
  'Dynamic Hangar Badges',
  'Public Shelf @handle',
  'Open Source XRPC Schemas',
]

const FEATURES = [
  {
    icon: Database,
    title: 'Decentralized PDS Storage',
    tag: 'build.gunpla.kit',
    color: '#ffdc58',
    description:
      'Every model kit record is stored directly in your personal data server. If gunpla.build vanished tomorrow, your build logs remain yours forever on ATProto.',
  },
  {
    icon: Layers,
    title: 'Step-by-Step Build Logs',
    tag: 'Pipeline',
    color: '#5cb8ff',
    description:
      'Track your kit from backlog to final display. Log runner clipping, nub cleanup, inner frame assembly, panel lining, water decals, and matte topcoat.',
  },
  {
    icon: Camera,
    title: 'High-Res Photo Timelines',
    tag: 'Up to 20 blobs',
    color: '#ff5c5c',
    description:
      'Upload uncompressed progress photos directly to your repository. Document intricate inner frames, custom scribing lines, and final posed glamour shots.',
  },
  {
    icon: Trophy,
    title: 'Dynamic Hangar Badges',
    tag: 'Computed Stats',
    color: '#a855f7',
    description:
      'Earn badges like First Completed Build, Hangar Master, Grade Specialist, and Backlog Conqueror — computed transparently from your verified ATProto records.',
  },
  {
    icon: Zap,
    title: 'Real-Time Jetstream Firehose',
    tag: 'Sub-second',
    color: '#22c55e',
    description:
      'Updates stream live across the network via WebSocket subscriptions. As soon as you log a kit, builders around the world see it on their feeds.',
  },
  {
    icon: Shield,
    title: 'Decentralized Bluesky Identity',
    tag: 'No Passwords',
    color: '#fb923c',
    description:
      'Sign in securely with your Bluesky handle. Your public shelf lives at gunpla.build/@handle and connects seamlessly to your social graph.',
  },
]

const GRADES = ['ALL', 'HG', 'RG', 'MG', 'PG', 'OTHER'] as const

export default function Home({ kits }: PageProps) {
  const page = usePage<PageProps>()
  const isSignedIn = Boolean(page.props.user)

  const [isLive, setIsLive] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL')
  const [activeLexiconTab, setActiveLexiconTab] = useState<'kit' | 'log' | 'curl'>('kit')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const subscription = transmit.subscription('kits')
    subscription
      .create()
      .then(() => setIsLive(true))
      .catch(() => setIsLive(false))

    const stop = subscription.onMessage(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsUpdating(true)
        router.reload({
          only: ['kits'],
          onFinish: () => setTimeout(() => setIsUpdating(false), 800),
        })
      }, 400)
    })

    return () => {
      stop()
      subscription.delete()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handles = useMemo(() => new Set(kits.map((k) => k.handle).filter(Boolean)), [kits])

  const filteredKits = useMemo(() => {
    if (selectedGrade === 'ALL') return kits
    if (selectedGrade === 'OTHER') {
      return kits.filter((k) => !['HG', 'RG', 'MG', 'PG'].includes(k.grade?.toUpperCase() || ''))
    }
    return kits.filter((k) => k.grade?.toUpperCase() === selectedGrade)
  }, [kits, selectedGrade])

  return (
    <>
      <style>{`
        @keyframes hero-marquee {
          0% { transform: translate(0); }
          to { transform: translate(-50%); }
        }
        @keyframes hero-bob {
          0%, 100% { transform: translateY(-6px) rotate(-10deg); }
          50%      { transform: translateY(8px) rotate(2deg); }
        }
        @keyframes hero-blink {
          0%, 93.5%, 100% { transform: scaleY(1); }
          94.8%           { transform: scaleY(0.1); }
          96.4%           { transform: scaleY(1.03); }
          97.5%           { transform: scaleY(1); }
        }
        .hero-marquee {
          backface-visibility: hidden;
          animation: 45s linear infinite hero-marquee;
        }
        .hero-bob {
          animation: 7s ease-in-out infinite hero-bob;
        }
        .hero-blink {
          transform-origin: 50% 60%;
          animation: 8s ease-in-out infinite hero-blink;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Replicated from neobrutalism.com)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-background">
        {/* Radial ambient glow backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_75%_at_68%_6%,color-mix(in_oklab,var(--primary)_34%,transparent)_0%,transparent_52%),radial-gradient(90%_55%_at_8%_38%,color-mix(in_oklab,var(--primary)_14%,transparent)_0%,transparent_50%),radial-gradient(85%_50%_at_92%_62%,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_48%),radial-gradient(70%_40%_at_20%_88%,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_50%)] [mask-image:linear-gradient(to_bottom,black_92%,transparent)]"
        />

        <section className="relative overflow-x-clip overflow-y-visible border-b-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-background from-15% via-background/70 via-50% to-transparent [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          />

          <div className="container relative z-10 mx-auto px-4 pt-8 pb-8 sm:pt-12 sm:pb-12 lg:pt-16 lg:pb-14">
            <div className="grid grid-cols-1 items-center gap-10 sm:gap-12 lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_36rem]">
              {/* Left Column: Heading, Subhead, Description & CTAs */}
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-start">
                {/* Announcement Badge */}
                <div className="mb-4 inline-flex items-center gap-2 border-2 border-border bg-card px-3.5 py-1 font-head text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_var(--border)]">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>Built on ATProto · Open Model Records</span>
                </div>

                {/* Big Neobrutal Headline with Cartoon Eyes Animation */}
                <h1 className="font-head text-4xl leading-[1.05] font-bold tracking-tight uppercase sm:text-5xl lg:leading-[0.98] xl:text-6xl">
                  <span>
                    BUILD, TRACK &{' '}
                    <span className="whitespace-nowrap">
                      L
                      <span
                        aria-hidden="true"
                        className="-mx-[0.08em] inline-flex items-baseline align-[-0.05em] whitespace-nowrap"
                      >
                        <span className="relative inline-block h-[0.92em] w-[0.72em] -translate-y-[0.08em] -rotate-[7deg]">
                          <span className="hero-blink absolute inset-0 overflow-hidden rounded-[48%_52%_55%_45%/55%_48%_52%_45%] border-[0.05em] border-black bg-white">
                            <span
                              className="absolute top-1/2 left-1/2 block size-[0.32em] rounded-full bg-black"
                              style={{
                                transform: 'translate(-50%, -50%) translate(-0.02em, 0.13em)',
                              }}
                            />
                          </span>
                        </span>
                        <span className="-ms-[0.16em] relative inline-block h-[0.86em] w-[0.68em] -translate-y-[0.04em] rotate-[5deg]">
                          <span className="hero-blink absolute inset-0 overflow-hidden rounded-[53%_47%_46%_54%/49%_55%_45%_51%] border-[0.05em] border-black bg-white [animation-delay:80ms]">
                            <span
                              className="absolute top-1/2 left-1/2 block size-[0.32em] rounded-full bg-black"
                              style={{
                                transform: 'translate(-50%, -50%) translate(-0.02em, 0.13em)',
                              }}
                            />
                          </span>
                        </span>
                      </span>
                      G
                    </span>{' '}
                    WITH{' '}
                    <span className="inline-block border-2 border-black bg-primary px-2 text-primary-foreground shadow-[3px_3px_0_0_var(--border)]">
                      GUNPLA.BUILD
                    </span>
                  </span>
                </h1>

                <p className="mt-3 font-head text-base font-bold tracking-wide text-muted-foreground sm:mt-4 sm:text-lg">
                  The open shelf for Gunpla builders on the AT Protocol.
                </p>

                <p className="mt-4 max-w-xl text-base font-medium text-balance text-foreground/80 sm:mt-5 sm:text-lg">
                  <strong className="font-bold text-foreground">gunpla.build</strong> is the
                  decentralized workbench for modelers. Log runner clipping, inner frames, panel
                  lining and matte topcoat, attach high-res photo timelines, and own your collection
                  directly in your ATProto repository — zero vendor lock-in.
                </p>

                {/* CTA Buttons */}
                <div className="mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link
                    route={isSignedIn ? 'shelf' : 'login'}
                    className="group/neo-hero-cta font-head inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded border-2 border-black bg-primary px-8 text-base font-bold tracking-wider text-primary-foreground uppercase shadow-[5px_5px_0_0_var(--shadow-color)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--shadow-color)] active:translate-x-1 active:translate-y-1 active:shadow-none sm:h-14 sm:w-auto sm:px-10 sm:text-lg"
                  >
                    <span>{isSignedIn ? 'Go to my shelf' : 'Start your shelf'}</span>
                    <ArrowRight className="ms-1.5 size-5 transition-transform duration-200 group-hover/neo-hero-cta:translate-x-1" />
                  </Link>

                  <a
                    href="#recent-builds"
                    className="group/neo-hero-sec font-head inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded border-2 border-border bg-card px-6 text-base font-bold tracking-wider text-foreground uppercase shadow-[3px_3px_0_0_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
                  >
                    <span>Explore live builds</span>
                    <ArrowRight className="ms-1.5 size-4 transition-transform duration-200 group-hover/neo-hero-sec:translate-x-0.5" />
                  </a>
                </div>

                {/* Quick stats indicator */}
                <div className="mt-8 flex items-center gap-6 border-t-2 border-border/40 pt-5 text-left">
                  <div>
                    <p className="font-head text-xl font-black text-foreground">
                      {kits.length > 0 ? `${kits.length}+` : '0'}
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      Builds Indexed
                    </p>
                  </div>
                  <div className="h-7 w-px bg-border/40" />
                  <div>
                    <p className="font-head text-xl font-black text-foreground">
                      {handles.size > 0 ? handles.size : '1'}
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      Builders
                    </p>
                  </div>
                  <div className="h-7 w-px bg-border/40" />
                  <div>
                    <p className="font-head text-xl font-black text-foreground">100%</p>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      ATProto Native
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Neobrutal Preview Card */}
              <div className="flex w-full justify-center lg:h-[27rem] lg:w-full lg:items-center lg:justify-stretch">
                <div className="relative h-[27rem] w-full max-w-[36rem] shrink-0 lg:w-full lg:max-w-none">
                  {/* Floating Gunpla Mascot (Bobbing) */}
                  <span
                    aria-hidden="true"
                    className="hero-bob pointer-events-none absolute -top-12 -right-3 z-20 hidden size-20 select-none object-contain drop-shadow-[2px_2px_0_0_var(--border)] lg:block"
                  >
                    <svg viewBox="0 0 88 88" fill="none" className="size-full">
                      <g
                        transform="rotate(-6 44 44)"
                        stroke="var(--border)"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      >
                        {/* V-Fin */}
                        <path
                          d="M44 32 L28 14 L34 11 L44 26 L54 11 L60 14 Z"
                          fill="var(--primary)"
                          strokeLinecap="round"
                        />
                        <polygon points="41,28 47,28 44,34" fill="#ff5c5c" />
                        {/* Helmet */}
                        <rect x="20" y="32" width="48" height="36" rx="4" fill="var(--card)" />
                        {/* Visor Area */}
                        <rect x="26" y="44" width="36" height="13" rx="2" fill="#1a1a1a" />
                        {/* Glowing Green Optics */}
                        <polygon points="30,48 37,48 36,52 31,52" fill="#22c55e" stroke="none" />
                        <polygon points="51,48 58,48 57,52 52,52" fill="#22c55e" stroke="none" />
                        {/* Red Chin Piece */}
                        <polygon points="40,62 48,62 46,68 42,68" fill="#ff5c5c" />
                      </g>
                    </svg>
                  </span>

                  {/* Offset solid backdrop */}
                  <div className="absolute -top-2 -left-2 right-2 bottom-2 border-2 border-border bg-primary" />

                  {/* Main Window Card */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden border-2 border-border bg-card shadow-[4px_4px_0_0_var(--border)]">
                    {/* Window Header */}
                    <div className="flex shrink-0 items-center gap-2.5 border-b-2 border-border bg-muted px-3.5 py-2.5">
                      <span aria-hidden="true" className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full border border-border bg-destructive" />
                        <span className="size-2.5 rounded-full border border-border bg-primary" />
                        <span className="size-2.5 rounded-full border border-border bg-[#22c55e]" />
                      </span>
                      <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
                      <span className="flex min-w-0 items-center gap-1.5 font-head text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full bg-[#22c55e] animate-pulse"
                        />
                        <span className="truncate">gunpla.build · ATProto Jetstream</span>
                      </span>
                    </div>

                    {/* Window Body: Chat / Firehose Simulation */}
                    <div
                      dir="ltr"
                      className="flex min-h-0 flex-1 flex-col justify-center gap-3.5 overflow-hidden bg-background p-4 sm:p-5"
                    >
                      {/* User message */}
                      <div className="flex items-end justify-end gap-2">
                        <div className="max-w-[88%] border-2 border-border bg-card px-3 py-2 shadow-[2px_2px_0_0_var(--border)] dark:bg-secondary dark:text-secondary-foreground">
                          <p className="font-head text-xs leading-snug font-bold tracking-tight sm:text-sm">
                            Log RG RX-78-2 Gundam Ver.2.0 — inner frame done, panel lining started!
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-muted font-head text-[0.6rem] font-bold dark:bg-secondary dark:text-secondary-foreground"
                        >
                          YOU
                        </span>
                      </div>

                      {/* App & Protocol Response */}
                      <div className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-primary font-head text-xs font-bold text-primary-foreground shadow-[2px_2px_0_0_var(--border)]"
                        >
                          <Sparkles className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-head text-[0.7rem] font-bold tracking-wide uppercase">
                              gunpla.build
                            </span>
                            <span className="text-[0.65rem] text-muted-foreground">via</span>
                            <span className="border border-border bg-muted px-1 py-px font-head text-[0.6rem] font-bold tracking-wider uppercase">
                              PDS Repo
                            </span>
                          </div>

                          <div className="space-y-2.5 border-2 border-border bg-card p-3 shadow-[3px_3px_0_0_var(--border)] sm:p-3.5 dark:bg-muted">
                            <p className="text-xs leading-snug text-foreground/85 sm:text-sm">
                              Record verified and committed to your personal ATProto repository.
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="border border-border bg-primary px-2 py-0.5 font-head text-[10px] font-bold text-primary-foreground">
                                Status: IN-PROGRESS
                              </span>
                              <span className="border border-border bg-background px-2 py-0.5 font-head text-[10px] font-bold">
                                RG 1/144
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                4 Photos Pinned
                              </span>
                            </div>

                            {/* Shell command chip */}
                            <div className="flex items-center gap-2 border-2 border-border bg-background px-2 py-1.5 font-mono text-[0.65rem] text-foreground sm:text-[0.7rem]">
                              <span
                                aria-hidden="true"
                                className="flex size-5 shrink-0 items-center justify-center border-2 border-border bg-primary font-bold text-primary-foreground"
                              >
                                $
                              </span>
                              <span className="min-w-0 truncate font-mono text-foreground">
                                atproto xrpc putRecord --collection build.gunpla.kit
                              </span>
                              <span
                                aria-hidden="true"
                                className="ms-auto flex size-5 shrink-0 items-center justify-center border-2 border-border bg-primary text-primary-foreground"
                              >
                                <Check className="size-3" strokeWidth={3} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Window Footer */}
                    <div className="flex shrink-0 items-center justify-between gap-2 border-t-2 border-border bg-muted px-3.5 py-2.5">
                      <span className="font-head text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        ATProto · Jetstream · Bluesky
                      </span>
                      <span className="font-head text-[0.65rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                        Own · Track · Share
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            TILTED INFINITE MARQUEE BAR (-rotate-2)
        ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 mb-4 overflow-hidden py-5 sm:mb-6 sm:py-6 lg:mb-8 lg:py-8">
          <div className="-mx-[10%] relative w-[120%] origin-center -rotate-2 border-y-[3px] border-border bg-foreground text-background shadow-[0_4px_0_0_var(--border)]">
            <div className="hero-marquee flex w-max py-2.5 will-change-transform [contain:layout_style] sm:py-3">
              <ul className="flex shrink-0 items-center">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 bg-foreground px-4 sm:gap-3.5 sm:px-5"
                  >
                    <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-background bg-primary font-head text-[0.6rem] font-bold text-primary-foreground shadow-[2px_2px_0_0_var(--background)]">
                      ★
                    </span>
                    <span className="font-head text-xs font-bold tracking-[0.14em] text-background sm:text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="flex shrink-0 items-center" aria-hidden="true">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <li
                    key={`dup-${idx}`}
                    className="flex items-center gap-3 bg-foreground px-4 sm:gap-3.5 sm:px-5"
                  >
                    <span className="inline-flex size-5 shrink-0 items-center justify-center border-2 border-background bg-primary font-head text-[0.6rem] font-bold text-primary-foreground shadow-[2px_2px_0_0_var(--background)]">
                      ★
                    </span>
                    <span className="font-head text-xs font-bold tracking-[0.14em] text-background sm:text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE COMMUNITY BUILDS FEED (#recent-builds)
      ───────────────────────────────────────────────────────────── */}
      <section id="recent-builds" className="border-t-2 border-border bg-muted/40 py-12 sm:py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          {/* Section Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 border-2 border-border bg-card px-2.5 py-0.5 font-head text-xs font-bold uppercase">
                <Rss className="size-3.5 text-primary" />
                <span>Live Feed</span>
              </div>
              <h2 className="font-head text-2xl font-bold tracking-tight uppercase sm:text-3xl">
                Recent Builds
              </h2>
              <p className="font-mono text-xs text-muted-foreground sm:text-sm">
                Real-time builds streaming straight from ATProto personal repositories.
              </p>
            </div>

            {/* Live WebSocket Status Pill */}
            {isLive && (
              <span
                className={cn(
                  'flex w-max items-center gap-2 border-2 border-border px-3 py-1 font-mono text-xs font-bold transition-colors',
                  isUpdating
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground shadow-[2px_2px_0_0_var(--border)]'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    isUpdating ? 'bg-primary-foreground animate-ping' : 'bg-[#22c55e]'
                  )}
                />
                {isUpdating ? 'Updating…' : 'Live Sync'}
              </span>
            )}
          </div>

          {/* Grade Filter Pills */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-head text-xs font-bold uppercase text-muted-foreground">
              Filter Grade:
            </span>
            {GRADES.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={cn(
                  'border-2 border-border px-3 py-1 font-head text-xs font-bold uppercase transition-all',
                  selectedGrade === grade
                    ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--border)]'
                    : 'bg-card text-foreground hover:bg-muted'
                )}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Kits Grid */}
          {filteredKits.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border bg-card p-12 text-center">
              <p className="font-head text-lg font-bold">No builds found for {selectedGrade}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Be the first to log a build in this grade!
              </p>
              <div className="mt-4">
                <Button size="sm" render={<Link route={isSignedIn ? 'shelf' : 'login'} />}>
                  Log a kit now
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredKits.map((kit) => (
                <div key={kit.uri} className="flex flex-col gap-1.5">
                  <KitCard
                    name={kit.name}
                    grade={kit.grade}
                    scale={kit.scale}
                    manufacturer={kit.manufacturer}
                    status={kit.status}
                    photoUrl={kit.photoUrl}
                    photoCount={kit.photoCount}
                  />
                  <div className="flex items-baseline justify-between gap-1 px-1">
                    {kit.handle ? (
                      <Link
                        route="profile"
                        routeParams={[kit.handle]}
                        className="truncate font-mono text-[11px] font-bold text-foreground hover:underline"
                      >
                        @{kit.handle}
                      </Link>
                    ) : (
                      <span />
                    )}
                    {kit.indexedAt && (
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {timeAgo(kit.indexedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. THE BUILDER'S ARSENAL / FEATURES GRID (#features)
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="border-t-2 border-border bg-background py-14 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 border-2 border-border bg-primary px-2.5 py-0.5 font-head text-xs font-bold text-primary-foreground uppercase shadow-[2px_2px_0_0_var(--border)]">
              <span>Why gunpla.build</span>
            </div>
            <h2 className="font-head text-3xl font-bold tracking-tight uppercase sm:text-4xl">
              The Builder&apos;s Arsenal
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Built specifically for model kit hobbyists who refuse to lock their records in walled
              gardens.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="group relative flex flex-col justify-between border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--border)]"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className="flex size-10 items-center justify-center border-2 border-border text-black shadow-[2px_2px_0_0_var(--border)]"
                        style={{ backgroundColor: feat.color }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="border border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="font-head text-lg font-bold tracking-tight text-foreground uppercase">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1 font-head text-xs font-bold text-foreground group-hover:text-primary-foreground">
                    <span className="underline-offset-4 group-hover:underline">Learn more</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE OPEN LEXICON & DEV EXPLORER (#lexicon)
      ───────────────────────────────────────────────────────────── */}
      <section id="lexicon" className="border-t-2 border-border bg-muted/30 py-14 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:text-left">
            <div className="mb-2 inline-flex items-center gap-2 border-2 border-border bg-card px-2.5 py-0.5 font-head text-xs font-bold uppercase shadow-[2px_2px_0_0_var(--border)]">
              <Code className="size-3.5 text-primary" />
              <span>Developer Protocol</span>
            </div>
            <h2 className="font-head text-3xl font-bold tracking-tight uppercase sm:text-4xl">
              100% Open Standards
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Explore the raw ATProto lexicon records powering gunpla.build. Build your own CLI,
              bot, or mobile client.
            </p>
          </div>

          {/* Tabbed schema viewer */}
          <div className="border-2 border-border bg-card shadow-[6px_6px_0_0_var(--border)]">
            {/* Tabs Bar */}
            <div className="flex flex-wrap items-center border-b-2 border-border bg-muted">
              {[
                { id: 'kit', label: 'build.gunpla.kit' },
                { id: 'log', label: 'build.gunpla.buildLog' },
                { id: 'curl', label: 'Query via cURL' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLexiconTab(tab.id as typeof activeLexiconTab)}
                  className={cn(
                    'border-r-2 border-border px-4 py-2.5 font-mono text-xs font-bold transition-colors',
                    activeLexiconTab === tab.id
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:bg-card/50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="overflow-x-auto bg-[#141414] p-5 font-mono text-xs leading-relaxed text-neutral-200">
              {activeLexiconTab === 'kit' && (
                <pre>{`{
  "lexicon": 1,
  "id": "build.gunpla.kit",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "description": "A Gunpla kit owned or tracked by a user.",
      "record": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "maxLength": 3000 },
          "grade": { "type": "string", "description": "HG, RG, MG, PG, SD, EG, etc." },
          "scale": { "type": "string", "description": "e.g. 1/144, 1/100" },
          "manufacturer": { "type": "string", "default": "Bandai" },
          "status": { "type": "string", "knownValues": ["backlog", "in-progress", "done"] },
          "photos": { "type": "array", "maxLength": 20, "items": { "type": "blob" } },
          "startedAt": { "type": "string", "format": "datetime" },
          "completedAt": { "type": "string", "format": "datetime" }
        },
        "required": ["name", "status", "createdAt"]
      }
    }
  }
}`}</pre>
              )}

              {activeLexiconTab === 'log' && (
                <pre>{`{
  "lexicon": 1,
  "id": "build.gunpla.buildLog",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "description": "A chronological step in a kit build.",
      "record": {
        "type": "object",
        "properties": {
          "kit": { "type": "string", "format": "at-uri" },
          "stage": { "type": "string", "knownValues": ["runner_cut", "inner_frame", "panel_lining", "decals", "topcoat"] },
          "notes": { "type": "string", "maxLength": 3000 },
          "photos": { "type": "array", "maxLength": 10, "items": { "type": "blob" } },
          "createdAt": { "type": "string", "format": "datetime" }
        },
        "required": ["kit", "stage", "createdAt"]
      }
    }
  }
}`}</pre>
              )}

              {activeLexiconTab === 'curl' && (
                <pre>{`# Query any user's public kit records via standard ATProto XRPC
curl -X GET \\
  "https://bsky.social/xrpc/com.atproto.repo.listRecords?\\
repo=amuro.bsky.social&\\
collection=build.gunpla.kit&\\
limit=50" \\
  -H "Accept: application/json"`}</pre>
              )}
            </div>

            <div className="flex items-center justify-between border-t-2 border-border bg-muted px-4 py-2 text-xs">
              <span className="font-mono text-[11px] text-muted-foreground">
                Decentralized ATProto Schemas
              </span>
              <a
                href="https://atproto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-head font-bold hover:underline"
              >
                <span>atproto.com</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BIG CALL TO ACTION BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="border-t-2 border-border bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-head text-3xl font-black uppercase sm:text-5xl">
            Ready to Clear Your Backlog?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium opacity-90 sm:text-lg">
            Sign in with your Bluesky handle. No passwords to invent, no lock-in, and 100% ownership
            of every build step.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              route={isSignedIn ? 'shelf' : 'login'}
              className="group/cta font-head inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded border-2 border-black bg-card px-10 text-lg font-bold tracking-wider text-card-foreground uppercase shadow-[5px_5px_0_0_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span>{isSignedIn ? 'Open my shelf' : 'Start your shelf now'}</span>
              <ArrowRight className="size-5 transition-transform duration-200 group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. NEOBRUTALIST FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t-2 border-border bg-card py-12 text-card-foreground">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <span className="font-head text-xl font-bold tracking-tight">gunpla.build</span>
              <p className="mt-2 max-w-sm font-mono text-xs text-muted-foreground">
                An open shelf and build tracker built on the AT Protocol. Log kits, share progress,
                and own your records forever.
              </p>
            </div>

            <div>
              <h4 className="font-head text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Explore
              </h4>
              <ul className="mt-3 space-y-2 font-mono text-xs">
                <li>
                  <a href="#recent-builds" className="hover:underline">
                    Recent Builds
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:underline">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#lexicon" className="hover:underline">
                    Lexicon Schemas
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-head text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Ecosystem
              </h4>
              <ul className="mt-3 space-y-2 font-mono text-xs">
                <li>
                  <a
                    href="https://bsky.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Bluesky Network
                  </a>
                </li>
                <li>
                  <a
                    href="https://atproto.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    AT Protocol Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t-2 border-border/40 pt-6 sm:flex-row font-mono text-[11px] text-muted-foreground">
            <p>© 2026 gunpla.build · Gundam and Gunpla are trademarks of Bandai Namco.</p>
            <p>Built with Neobrutalism on ATProto.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

Home.layout = [BaseLayout]
