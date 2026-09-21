from typesafe_sdk import AsyncTypeSafeClient, Score, ScoreAnswer
from claude_evaluator.model.response import Scores, Score as ScoreResult
from claude_evaluator.model.query_result import QueryResult

EVAL_QUESTIONS = {
    "relevance": Score(
        instructions=(
            "How well does `answer` address what `question` actually asks? "
            "Judge only whether the content of `answer` matches `question`, "
            "not how well it is written."
        ),
        criteria=[
            "Off topic; `answer` does not address `question`",
            "Partially on topic, but misses the core of `question` or answers a different one",
            "Answers `question`, but with tangents or unrequested material mixed in",
            "Directly and fully answers exactly what `question` asks",
        ],
    ),
    "conciseness": Score(
        instructions=(
            "Evaluate only `answer`. How much of it is necessary to answer `question`? "
            "Penalize length that adds no information: preambles, restating `question`, "
            "repeated points, summaries of what was just said, unrequested caveats or "
            "alternatives, and padding. Judge the amount of content, not the writing style "
            "or sentence structure. An `answer` that omits something `question` needs is "
            "incomplete, not concise; do not reward that. The length of `question` itself "
            "is irrelevant."
        ),
        criteria=[
            "Heavily padded; most of `answer` could be removed without losing anything",
            "Noticeably longer than needed; several paragraphs or points add nothing",
            "Mostly tight, with some removable filler or repetition",
            "Every sentence carries information; nothing could be cut without loss",
        ],
    ),
    "readability": Score(
        instructions=(
            "Evaluate only `answer`; ignore `question` except to understand context. "
            "How easy is `answer` to read, given its length? Penalize ornate or poetic "
            "phrasing, needlessly sophisticated vocabulary, and long or structurally "
            "complex sentences. Judge how `answer` is written, not how much of it there is."
        ),
        criteria=[
            "Ornate and convoluted; flowery language and long nested sentences",
            "Noticeably embellished or complex; takes effort to follow",
            "Mostly clear, with occasional flourishes or long sentences",
            "Plain and direct; simple words and short sentences",
        ],
    ),
}


def normalized(answer: ScoreAnswer, question_id: str) -> float:
    """Put a score on 0 to 1 by dividing by its top level number."""
    top_level = len(EVAL_QUESTIONS[question_id].criteria) - 1
    return answer.score / top_level


async def get_score(question: str, result: QueryResult) -> Scores:
    async with AsyncTypeSafeClient() as client:
        response = await client.system_one(
            state={"question": question, "answer": result.result},
            questions=EVAL_QUESTIONS,
        )
    scores: dict[str, ScoreResult] = {}
    for key, answer in response.scores.items():
        scores[key] = ScoreResult(
            label=key,
            score=normalized(answer, question_id=key),
            confidence=answer.confidence,
            legend={k: str(v) for k, v in answer.legend.items()},
            scale_max=1,
        )

    return Scores(
        readability=scores["readability"],
        relevance=scores["relevance"],
        conciseness=scores["conciseness"],
    )
