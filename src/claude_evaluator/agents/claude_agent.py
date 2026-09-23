from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
from pydantic import BaseModel


class ClaudeResponse(BaseModel):
    result: str
    latency_ms: int


class ClaudeAgent:
    """Claude Agent uses claude agent sdk python for querying the input prompt."""

    options: ClaudeAgentOptions

    def __init__(self, model="claude-sonnet-5") -> None:
        self.options = ClaudeAgentOptions(
            model=model,
            system_prompt="You are a helpful assistant. Answer concisely.",
            effort="low",
            max_turns=1,
            tools=[],
            setting_sources=[],
        )

    async def query(self, prompt: str) -> ClaudeResponse:
        """query sends prompt by using claude_agent_sdk and receives messages then return result if exist"""

        async for msg in query(prompt=prompt, options=self.options):
            if isinstance(msg, ResultMessage) and msg.result:
                return ClaudeResponse(
                    result=msg.result, latency_ms=msg.duration_api_ms or 0
                )

        raise RuntimeError("result not available")
