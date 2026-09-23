set shell := ["bash", "-cu"]

default:
    @just --list

dev:
    #!/usr/bin/env bash
    set -m
    (cd frontend && npm run dev) & FE=$!
    uv run fastapi dev & BE=$!
    trap 'trap - INT TERM; kill -- -$FE -$BE 2>/dev/null; wait' INT TERM
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
