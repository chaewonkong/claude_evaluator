import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from claude_evaluator.agents.claude_agent import ClaudeAgent
from claude_evaluator.agents.jev_agent import JevAgent
from claude_evaluator.router import router

STATIC_DIR = Path(os.getenv("STATIC_DIR", Path(__file__).resolve().parents[2] / "frontend" / "dist"))


app = FastAPI()
app.include_router(
    router(claude_agent=ClaudeAgent(), jev_agent=JevAgent()), prefix="/api"
)

if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
