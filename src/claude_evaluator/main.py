from fastapi import FastAPI
from claude_evaluator.agents.claude_agent import ClaudeAgent
from claude_evaluator.agents.jev_agent import JevAgent
from claude_evaluator.router import router


app = FastAPI()
app.include_router(
    router(claude_agent=ClaudeAgent(), jev_agent=JevAgent()), prefix="/api"
)
