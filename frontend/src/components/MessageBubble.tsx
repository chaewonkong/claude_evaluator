import type { Message } from '../types'
import ScoreBadges from './ScoreBadges'

function PendingDots() {
  return (
    <div className="flex items-center gap-1 py-2" aria-label="답변 생성 중">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export default function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-neutral-200 px-4 py-2 leading-relaxed dark:bg-neutral-700">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-full">
        {message.status === 'pending' && <PendingDots />}
        {message.status === 'error' && (
          <p className="whitespace-pre-wrap leading-relaxed text-red-600 dark:text-red-400">
            {message.content}
          </p>
        )}
        {message.status === 'done' && (
          <>
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            {message.scores && <ScoreBadges scores={message.scores} />}
            {!message.scores && message.evaluationError && (
              <span
                className="mt-3 inline-flex rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                title={message.evaluationError}
              >
                평가 불가
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
