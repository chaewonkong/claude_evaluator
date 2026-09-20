# Claude Evaluator
A Web UI based Claude chat with evaluated answer with Jev.

- User sends questions
- Claude reasons and answers
- Jev evaluates answers
- User reads answers with evaluated scores.

## Frontend (`frontend/`)

Vite + React + TypeScript + Tailwind v4.

### 준비 (최초 1회)

Node 24는 [mise](https://mise.jdx.dev)로 관리합니다 (`mise.toml`).

```bash
mise install          # node 24 + npm 설치
cd frontend && npm install
```

### 개발 서버

```bash
cd frontend && npm run dev     # http://localhost:5173
```

`/api/*` 요청은 `vite.config.ts`의 프록시를 통해 `http://localhost:8000`(Python 백엔드)으로 전달됩니다.

### 빌드

```bash
cd frontend && npm run build   # -> frontend/dist
```

백엔드에서 `frontend/dist`를 정적 파일로 서빙하면 단일 프로세스로 실행할 수 있습니다.

## 백엔드 API 계약

정식 계약은 [`docs/api-schema.yaml`](docs/api-schema.yaml)(OpenAPI 3.1)에 있습니다. 구현 후 `http://localhost:8000/openapi.json`과 비교하세요. 요약은 아래와 같습니다.

`POST /api/chat` — 요청 `{ "question": string }`

```json
{
  "answer": "...",
  "scores": {
    "relevance":   { "label": "관련성", "score": 4.6, "confidence": 0.91, "scale_max": 5, "legend": { "1": "...", "5": "..." } },
    "conciseness": { "label": "간결성", "score": 3.8, "confidence": 0.72, "scale_max": 5, "legend": {} },
    "readability": { "label": "가독성", "score": 4.2, "confidence": 0.85, "scale_max": 5, "legend": {} }
  },
  "evaluation_error": null
}
```

- Jev 평가 실패: `200` + `"scores": null` + `"evaluation_error": "..."` → UI는 답변과 함께 "평가 불가" 칩을 표시
- Claude 호출 실패: `502`/`504` + `{ "detail": { "code": "...", "message": "..." } }` → UI는 에러 메시지를 표시
- 검증 실패(빈 질문 등): `422` (FastAPI 기본 `detail` 배열도 처리됨)
