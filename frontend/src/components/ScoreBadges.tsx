import type { AxisScore, Scores } from '../types'

const AXES: (keyof Scores)[] = ['relevance', 'conciseness', 'readability']

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

function ScoreRow({ axis }: { axis: AxisScore }) {
  const t = tone(axis.score, axis.scale_max)
  const pct = Math.max(0, Math.min(100, (axis.score / axis.scale_max) * 100))
  return (
    <div className="flex min-w-0 flex-col gap-1.5" title={tooltip(axis)}>
      <div className="flex items-baseline justify-between gap-2.5 text-sm whitespace-nowrap">
        <span className="font-medium text-neutral-500 capitalize dark:text-neutral-400">{axis.label}</span>
        <span className={`tabular-nums ${t.text}`}>
          {axis.score.toFixed(1)}
          <span className="text-neutral-400 dark:text-neutral-500"> / {axis.scale_max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
        <div className={`h-full rounded ${t.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ScoreBadges({ scores }: { scores: Scores }) {
  const avg = AXES.reduce((sum, key) => sum + scores[key].score / scores[key].scale_max, 0) / AXES.length

  return (
    <aside
      aria-label="답변 품질 점수"
      className="flex flex-col gap-3 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 py-3.5 md:sticky md:top-3 dark:border-neutral-800 dark:bg-neutral-800/40"
    >
      <div className="flex flex-col gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <span className="text-[15px] font-semibold">Answer Quality</span>
        <span className="text-[13px] font-medium text-neutral-500 tabular-nums dark:text-neutral-400">
          Avg. {Math.round(avg * 100)}%
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-x-5 gap-y-3 md:grid-cols-1">
        {AXES.map((key) => (
          <ScoreRow key={key} axis={scores[key]} />
        ))}
      </div>
    </aside>
  )
}
