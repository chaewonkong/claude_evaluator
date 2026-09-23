set shell := ["bash", "-cu"]

default:
    @just --list

dev:
    #!/usr/bin/env bash
    trap 'kill 0' INT TERM
    (cd frontend && npm run dev) &
    uv run fastapi dev &
    wait

fe:
    cd frontend && npm run dev

be:
    uv run fastapi dev

build:
    cd frontend && npm run build

install:
    uv sync
    cd frontend && npm ci
