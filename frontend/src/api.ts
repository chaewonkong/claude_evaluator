import type { ChatResponse } from './types'

/** FastAPI의 `detail` 필드는 객체 / 문자열 / 배열(pydantic 422) 어느 형태든 올 수 있다. */
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
    throw new Error('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해 주세요.')
  }

  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      /* 본문이 JSON이 아니면 상태 코드만 사용 */
    }
    throw new Error(extractDetail(body, res.status))
  }

  return (await res.json()) as ChatResponse
}
