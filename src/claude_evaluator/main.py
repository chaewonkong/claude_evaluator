from fastapi import FastAPI
from claude_evaluator.model.request import ChatRequest
from claude_evaluator.model.response import ChatResponse, Score, Scores
from claude_evaluator.agent.claude_agent import query_agent


app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(chat: ChatRequest) -> ChatResponse:
    result = await query_agent(chat.question)
    # TODO: use chat
    relevance = Score(label="relevance", scale_max=1, confidence=1, score=1, legend={})
    readability = Score(
        label="readability", scale_max=1, confidence=1, score=1, legend={}
    )
    conciseness = Score(
        label="conciseness", scale_max=1, confidence=1, score=1, legend={}
    )

    scores = Scores(
        relevance=relevance,
        readability=readability,
        conciseness=conciseness,
    )

    return ChatResponse(answer=result.result, scores=scores, evaluation_error=None)
