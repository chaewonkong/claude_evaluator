from pydantic import BaseModel


class Score(BaseModel):
    label: str
    score: float
    confidence: float
    scale_max: int
    legend: dict[int, str]
    probabilities: dict[str, float]


class Scores(BaseModel):
    relevance: Score
    conciseness: Score
    readability: Score
    latency: Score


class ChatResponse(BaseModel):
    answer: str
    scores: Scores
    evaluation_error: str | None
