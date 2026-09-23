from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, ResultMessage


class ClaudeAgent:
    """Claude Agent uses claude agent sdk python for querying the input prompt."""

    client: ClaudeSDKClient

    def __init__(self) -> None:
        options = ClaudeAgentOptions(
            model="claude-opus-5",
            system_prompt="You are a helpful assistant. Answer concisely.",
            effort="low",
            max_turns=1,
            tools=[],
            setting_sources=[],
        )
        self.client = ClaudeSDKClient(options=options)

    async def query(self, prompt: str) -> str | None:
        """query sends prompt by using claude_agent_sdk and receives messages then return result if exist"""
        await self.client.query(prompt=prompt)

        async for msg in self.client.receive_messages():
            if isinstance(msg, ResultMessage) and msg.result:
                return msg.result

        return
