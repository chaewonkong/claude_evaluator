from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
from claude_evaluator.model.query_result import QueryResult


async def query_agent(prompt: str) -> QueryResult:
    options = ClaudeAgentOptions(
        model="claude-opus-5",
        max_turns=1,
        allowed_tools=[],
        output_format={
            "type": "json_schema",
            "schema": QueryResult.model_json_schema(),
        },
    )
    async for msg in query(prompt=prompt, options=options):
        if isinstance(msg, ResultMessage):
            return QueryResult.model_validate(msg.structured_output)
    raise RuntimeError("no result")  # TODO: fix
