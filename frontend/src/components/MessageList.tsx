import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'
import ScoreBadges from './ScoreBadges'

type Turn = { key: string; user?: Message; assistant?: Message }

function groupTurns(messages: Message[]): Turn[] {
  const turns: Turn[] = []
  for (const m of messages) {
    const last = turns[turns.length - 1]
    if (m.role === 'assistant' && last && last.user && !last.assistant) {
      last.assistant = m
    } else if (m.role === 'user') {
      turns.push({ key: m.id, user: m })
    } else {
      turns.push({ key: m.id, assistant: m })
    }
  }
  return turns
}

function TurnRow({ turn }: { turn: Turn }) {
  const scores = turn.assistant?.status === 'done' ? turn.assistant.scores : null
  return (
    <div className="grid gap-y-7 md:col-span-2 md:grid-cols-subgrid md:gap-y-0">
      <div className="flex min-w-0 flex-col gap-7 md:col-start-1 md:gap-6">
        {turn.user && <MessageBubble message={turn.user} />}
        {turn.assistant && <MessageBubble message={turn.assistant} />}
      </div>
      {scores && (
        <div className="md:col-start-2">
          <ScoreBadges scores={scores} />
        </div>
      )}
    </div>
  )
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const lastUserId = messages.findLast((m) => m.role === 'user')?.id

  useEffect(() => {
    if (!lastUserId) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-message-id="${lastUserId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [lastUserId])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Claude Evaluator</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Ask a question to see Claude's answer along with its quality scores.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto grid w-full max-w-4xl gap-y-7 px-4 py-6 md:grid-cols-[minmax(0,1fr)_220px] md:gap-x-15 md:gap-y-6">
        {groupTurns(messages).map((t) => (
          <TurnRow key={t.key} turn={t} />
        ))}
      </div>
    </div>
  )
}
