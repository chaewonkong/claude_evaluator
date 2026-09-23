from typesafe_sdk import AsyncTypeSafeClient, Score, ScoreAnswer
from claude_evaluator.model.response import Scores, Score as ScoreResult

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
    "expected_effort": Score(
        instructions=(
            "Estimate how much generation effort `answer` legitimately requires, "
            "given the difficulty of `question` and the length and depth of `answer`. "
            "Consider reasoning depth, amount of domain knowledge, and output length. "
            "Do not judge quality; judge only how much work a correct answer needs."
        ),
        criteria=[
            "Trivial; a one-line factual or conversational reply",
            "Simple; a short explanation with no real reasoning",
            "Moderate; multi-step explanation, some reasoning or code",
            "Heavy; deep reasoning, long structured output, or complex code",
        ],
    ),
}

LATENCY_QUESTION = {
    "latency": Score(
        instructions=(
            "`latency_ms` is how long generating `answer` took. "
            "`expected_effort` describes how much work the answer legitimately needs, "
            "and `budget_ms` is the reasonable time for that effort level. "
            "Score how `latency_ms` compares to `budget_ms`. "
            "Do not re-evaluate the difficulty; take `expected_effort` as given."
        ),
        criteria=[
            "Far too slow; more than twice `budget_ms`",
            "Slow; noticeably over `budget_ms`",
            "Acceptable; around `budget_ms`",
            "Fast; well under `budget_ms`",
        ],
    ),
}
LATENCY_BUDGET_MS = {0: 2_000, 1: 5_000, 2: 12_000, 3: 30_000}


class JevAgent:
    async def evaluate(self, prompt: str, result: str, latency_ms: int) -> Scores:
        async with AsyncTypeSafeClient() as client:
            firesResponse = await client.system_one(
                state={"question": prompt, "answer": result},
                questions=EVAL_QUESTIONS,
            )
            scores: dict[str, ScoreResult] = {}
            for key, answer in firesResponse.scores.items():
                legend = {k: str(v) for k, v in answer.legend.items()}
                scores[key] = ScoreResult(
                    label=key,
                    score=self._normalized(EVAL_QUESTIONS, answer, question_id=key),
                    confidence=answer.confidence,
                    legend=legend,
                    scale_max=1,
                    probabilities=self._get_probability(legend, answer.probabilities),
                )

            effort = scores["expected_effort"]
            level = int(round(effort.score))
            secondResponse = await client.system_one(
                state={
                    "question": prompt,
                    "answer": result,
                    "expected_effort": effort.legend[level],
                    "budget_ms": LATENCY_BUDGET_MS[level],
                    "latency_ms": latency_ms,
                },
                questions=LATENCY_QUESTION,
            )
            for key, answer in secondResponse.scores.items():
                legend = {k: str(v) for k, v in answer.legend.items()}
                scores[key] = ScoreResult(
                    label=key,
                    score=self._normalized(LATENCY_QUESTION, answer, question_id=key),
                    confidence=answer.confidence,
                    legend=legend,
                    scale_max=1,
                    probabilities=self._get_probability(legend, answer.probabilities),
                )

            return Scores(
                readability=scores["readability"],
                relevance=scores["relevance"],
                conciseness=scores["conciseness"],
                latency=scores["latency"],
                expected_effort=scores["expected_effort"],
            )

    def _get_probability(
        self, legend: dict[int, str], prob: dict[int, float]
    ) -> dict[str, float]:
        result: dict[str, float] = {}

        for offset, probability in prob.items():
            target_legend = legend.get(offset, None)
            if target_legend:
                result[target_legend] = probability

        return result

    def _normalized(
        self, questions: dict[str, Score], answer: ScoreAnswer, question_id: str
    ) -> float:
        """Put a score on 0 to 1 by dividing by its top level number."""
        top_level = len(questions[question_id].criteria) - 1
        return answer.score / top_level
