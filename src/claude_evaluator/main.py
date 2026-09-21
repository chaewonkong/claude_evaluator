from fastapi import FastAPI
from claude_evaluator.model.request import ChatRequest
from claude_evaluator.model.response import ChatResponse, Score, Scores
from claude_evaluator.agent.claude_agent import query_agent
from claude_evaluator.agent.jev_agent import get_score


app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(chat: ChatRequest) -> ChatResponse:
    result = await query_agent(chat.question)
    scores = await get_score(chat.question, result=result)

    return ChatResponse(answer=result.result, scores=scores, evaluation_error=None)
