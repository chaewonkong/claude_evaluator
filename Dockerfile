# frontend
FROM node:24-slim AS fe
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# server
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock README.md ./
COPY src/ src/
RUN uv sync --frozen --no-dev
COPY --from=fe /fe/dist /app/static
ENV STATIC_DIR=/app/static
CMD ["uv", "run", "fastapi", "run", "--port", "8000"]