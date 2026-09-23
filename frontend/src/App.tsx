import { useState } from 'react'
import { sendChat } from './api'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import type { Message } from './types'

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)

  async function handleSend(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, status: 'done' }
    const placeholderId = crypto.randomUUID()
    const placeholder: Message = { id: placeholderId, role: 'assistant', content: '', status: 'pending' }

    setMessages((prev) => [...prev, userMsg, placeholder])
    setBusy(true)

    let resolved: Partial<Message>
    try {
      const res = await sendChat(text)
      resolved = {
        status: 'done',
        content: res.answer,
        scores: res.scores,
        evaluationError: res.evaluation_error,
      }
    } catch (err) {
      resolved = {
        status: 'error',
        content: err instanceof Error ? err.message : 'An unknown error occurred.',
      }
    }

    setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, ...resolved } : m)))
    setBusy(false)
  }

  return (
    <div className="flex h-dvh flex-col bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 text-sm font-semibold">Claude Evaluator</div>
      </header>
      <MessageList messages={messages} />
      <ChatInput busy={busy} onSend={handleSend} />
    </div>
  )
}
