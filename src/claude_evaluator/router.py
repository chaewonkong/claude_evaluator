from fastapi import APIRouter
from claude_evaluator.model.request import ChatRequest
from claude_evaluator.model.response import ChatResponse
from claude_evaluator.agents.claude_agent import ClaudeAgent
from claude_evaluator.agents.jev_agent import JevAgent


def router(claude_agent: ClaudeAgent, jev_agent: JevAgent) -> APIRouter:
    router = APIRouter()

    @router.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @router.post("/chat")
    async def chat(chat: ChatRequest) -> ChatResponse:
        result = await claude_agent.query(chat.question)
        if not result:
            raise RuntimeError("model result not available")

        scores = await jev_agent.evaluate(chat.question, result=result)

        return ChatResponse(answer=result, scores=scores, evaluation_error=None)

    return router
