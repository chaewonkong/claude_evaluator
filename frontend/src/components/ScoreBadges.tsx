import type { AxisScore, Scores } from '../types'

const AXES: (keyof Scores)[] = ['relevance', 'conciseness', 'readability']

function tone(score: number, max: number) {
  const ratio = score / max
  if (ratio >= 0.8) {
    return {
      chip: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
      bar: 'bg-green-500',
    }
  }
  if (ratio >= 0.6) {
    return {
      chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
      bar: 'bg-amber-500',
    }
  }
  return {
    chip: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    bar: 'bg-red-500',
  }
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

function Badge({ axis }: { axis: AxisScore }) {
  const t = tone(axis.score, axis.scale_max)
  const pct = Math.max(0, Math.min(100, (axis.score / axis.scale_max) * 100))
  return (
    <div className="flex flex-col gap-1" title={tooltip(axis)}>
      <span
        className={`inline-flex items-baseline gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.chip}`}
      >
        <span>{axis.label}</span>
        <span className="tabular-nums">
          {axis.score.toFixed(1)}
          <span className="opacity-60"> / {axis.scale_max}</span>
        </span>
      </span>
      <div className="h-1 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700">
        <div className={`h-full rounded ${t.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ScoreBadges({ scores }: { scores: Scores }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {AXES.map((key) => (
        <div key={key} className="w-28">
          <Badge axis={scores[key]} />
        </div>
      ))}
    </div>
  )
}
