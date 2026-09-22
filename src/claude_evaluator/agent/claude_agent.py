from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


async def query_agent(prompt: str) -> str:
    options = ClaudeAgentOptions(
        model="claude-opus-5",
        max_turns=1,
        allowed_tools=[],
    )
    async for msg in query(prompt=prompt, options=options):
        if isinstance(msg, ResultMessage):
            return msg.result or ""
    raise RuntimeError("no result")  # TODO: fix
