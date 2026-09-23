set shell := ["bash", "-cu"]

default:
    @just --list

dev:
    cd frontend && npm run build
    uv run fastapi run

fe:
    cd frontend && npm run dev

be:
    uv run fastapi dev

build:
    cd frontend && npm run build

install:
    uv sync
    cd frontend && npm ci
