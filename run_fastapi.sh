#!/bin/bash
# Script to run FastAPI backend in development mode
echo "🐍 Starting FastAPI backend..."
source ./api/.venv/bin/activate && uvicorn api.main:app --reload --port 8000
