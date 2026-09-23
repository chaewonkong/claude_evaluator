import type { AxisScore, Scores } from '../types'

const AXES: (keyof Scores)[] = ['relevance', 'conciseness', 'readability']
const WEAK_THRESHOLD = 0.5

function tone(score: number, max: number) {
  const ratio = score / max
  if (ratio >= 0.8) return { text: 'text-green-800 dark:text-green-200', bar: 'bg-green-500' }
  if (ratio >= 0.6) return { text: 'text-amber-800 dark:text-amber-200', bar: 'bg-amber-500' }
  return { text: 'text-red-800 dark:text-red-200', bar: 'bg-red-500' }
}

function tooltip(axis: AxisScore) {
  const lines = [`confidence ${Math.round(axis.confidence * 100)}%`]
  const legend = Object.entries(axis.legend)
  if (legend.length > 0) {
    lines.push('')
    for (const [k, v] of legend) lines.push(`${k}: ${v}`)
  }
  return lines.join('\n')
}

function topCriterion(axis: AxisScore) {
  const entries = Object.entries(axis.probabilities ?? {})
  if (entries.length === 0) return null
  const sorted = [...entries].sort(([a], [b]) => Number(a) - Number(b))
  const [key, p] = sorted.reduce((best, cur) => (cur[1] > best[1] ? cur : best))
  return { key, p, text: axis.legend[key] ?? `criteria ${key}`, dist: sorted }
}

function Criterion({ axis, bar }: { axis: AxisScore; bar: string }) {
  const top = topCriterion(axis)
  if (!top) return null
  const weak = top.p < WEAK_THRESHOLD
  return (
    <div className="group relative flex items-start gap-2 text-[12.5px] leading-[1.35]" tabIndex={0}>
      <span className={`mt-[6px] h-1.5 w-1.5 flex-none rounded-full ${bar}`} />
      <p
        className={`m-0 min-w-0 flex-1 ${weak ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}`}
      >
        {top.text}
      </p>
      <span className="flex-none text-neutral-400 tabular-nums dark:text-neutral-500">{Math.round(top.p * 100)}%</span>
      <div className="pointer-events-none invisible absolute top-full left-0 z-10 mt-1.5 w-[260px] max-w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-[12px] text-neutral-700 shadow-lg group-hover:visible group-focus-within:visible dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        {top.dist.map(([k, p]) => {
          const isTop = k === top.key
          return (
            <div
              key={k}
              className={`my-0.5 grid grid-cols-[14px_1fr_36px] items-center gap-1.5 tabular-nums ${isTop ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}`}
            >
              <span>{k}</span>
              <span className="relative h-1 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
                <span className="absolute inset-y-0 left-0 rounded bg-current" style={{ width: `${p * 100}%` }} />
              </span>
              <span className="text-right">{Math.round(p * 100)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScoreRow({ axis }: { axis: AxisScore }) {
  const t = tone(axis.score, axis.scale_max)
  const pct = Math.max(0, Math.min(100, (axis.score / axis.scale_max) * 100))
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2.5 text-sm whitespace-nowrap" title={tooltip(axis)}>
        <span className="font-medium text-neutral-500 capitalize dark:text-neutral-400">{axis.label}</span>
        <span className={`tabular-nums ${t.text}`}>
          {axis.score.toFixed(1)}
          <span className="text-neutral-400 dark:text-neutral-500"> / {axis.scale_max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
        <div className={`h-full rounded ${t.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <Criterion axis={axis} bar={t.bar} />
    </div>
  )
}

export default function ScoreBadges({ scores }: { scores: Scores }) {
  const avg = AXES.reduce((sum, key) => sum + scores[key].score / scores[key].scale_max, 0) / AXES.length

  return (
    <aside
      aria-label="Answer quality scores"
      className="flex flex-col gap-3 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 py-3.5 md:sticky md:top-3 dark:border-neutral-800 dark:bg-neutral-800/40"
    >
      <div className="flex flex-col gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <span className="text-[15px] font-semibold">Answer Quality</span>
        <span className="text-[13px] font-medium text-neutral-500 tabular-nums dark:text-neutral-400">
          Avg. {Math.round(avg * 100)}%
        </span>
      </div>
      <div className="grid grid-cols-1 gap-y-5">
        {AXES.map((key) => (
          <ScoreRow key={key} axis={scores[key]} />
        ))}
      </div>
    </aside>
  )
}
