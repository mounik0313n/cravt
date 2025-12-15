#!/usr/bin/env bash
# Render build script for production deployment

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized')"

echo "Build complete!"
