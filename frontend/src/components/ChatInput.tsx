import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

const MAX_HEIGHT = 200

type Props = {
  busy: boolean
  onSend: (text: string) => void
}

export default function ChatInput({ busy, onSend }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const canSend = !busy && text.trim().length > 0

  function resize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }

  function submit() {
    if (!canSend) return
    onSend(text.trim())
    setText('')
    requestAnimationFrame(() => {
      resize()
      ref.current?.focus()
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // 한국어 IME 조합 중 Enter는 무시 (조합 확정용)
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="sticky bottom-0 border-t border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-300 bg-white px-3 py-2 shadow-sm focus-within:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-neutral-400">
          <textarea
            ref={ref}
            rows={1}
            value={text}
            disabled={busy}
            placeholder="질문을 입력하세요… (Enter 전송, Shift+Enter 줄바꿈)"
            onChange={(e) => {
              setText(e.target.value)
              resize()
            }}
            onKeyDown={handleKeyDown}
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1 leading-relaxed outline-none placeholder:text-neutral-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  )
}
