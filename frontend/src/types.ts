export type AxisScore = {
  label: string
  score: number
  confidence: number
  scale_max: number
  legend: Record<string, string>
}

export type Scores = {
  relevance: AxisScore
  conciseness: AxisScore
  readability: AxisScore
}

export type ChatResponse = {
  answer: string
  scores: Scores | null
  evaluation_error: string | null
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  scores?: Scores | null
  evaluationError?: string | null
  status: 'pending' | 'done' | 'error'
}
