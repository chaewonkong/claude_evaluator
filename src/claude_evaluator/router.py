from fastapi import APIRouter

from claude_evaluator.agents.claude_agent import ClaudeAgent
from claude_evaluator.agents.jev_agent import JevAgent
from claude_evaluator.model.request import ChatRequest
from claude_evaluator.model.response import ChatResponse


def router(claude_agent: ClaudeAgent, jev_agent: JevAgent) -> APIRouter:
    router = APIRouter()

    @router.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @router.post("/chat")
    async def chat(chat: ChatRequest) -> ChatResponse:
        modelResponse = await claude_agent.query(chat.question)
        if not modelResponse:
            raise RuntimeError("model result not available")

        scores = await jev_agent.evaluate(
            chat.question,
            result=modelResponse.result,
            latency_ms=modelResponse.latency_ms,
        )

        return ChatResponse(
            answer=modelResponse.result, scores=scores, evaluation_error=None
        )

    return router
