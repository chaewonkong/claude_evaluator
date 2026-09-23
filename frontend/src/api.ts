import type { ChatResponse } from './types'

/** FastAPI's `detail` field can be an object, a string, or an array (pydantic 422). */
function extractDetail(body: unknown, status: number): string {
  const fallback = `HTTP ${status}`
  if (!body || typeof body !== 'object') return fallback
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: unknown } | undefined
    return typeof first?.msg === 'string' ? first.msg : fallback
  }
  if (detail && typeof detail === 'object') {
    const msg = (detail as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return fallback
}

export async function sendChat(question: string): Promise<ChatResponse> {
  let res: Response
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
  } catch {
    throw new Error('Could not connect to the server. Make sure the backend is running.')
  }

  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      /* Fall back to the status code if the body is not JSON */
    }
    throw new Error(extractDetail(body, res.status))
  }

  return (await res.json()) as ChatResponse
}
