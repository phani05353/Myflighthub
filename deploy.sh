#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# MyFlightHub — homelab deploy script
# Run from: /home/phanikumar/flighthub/
#
# Layout expected:
#   flighthub/
#   ├── deploy.sh             ← this script
#   ├── .env                  ← created on first run; edit before re-running
#   ├── myflighthub/          ← git repo (auto-cloned if missing)
#   └── data/                 ← SQLite DB (never touched)
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/phani05353/myflighthub"
REPO_DIR="myflighthub"
IMAGE_NAME="flighthub"
CONTAINER_NAME="flighthub"
HOST_PORT="8090"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   MyFlightHub — Deploy              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 0. Ensure .env exists and is configured ───────────────────────────────────
ENV_FILE="$BASE_DIR/.env"

# Clone/pull the repo first so we can read .env.example if needed
if [ ! -d "$BASE_DIR/$REPO_DIR/.git" ]; then
  echo "▶ Step 0 — Cloning repo to read .env.example..."
  cd "$BASE_DIR"
  git clone "$REPO_URL" "$REPO_DIR"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "▶ Step 0 — First run detected. Creating .env from template..."
  cp "$BASE_DIR/$REPO_DIR/.env.example" "$ENV_FILE"
  echo ""
  echo "  ┌─────────────────────────────────────────────────────┐"
  echo "  │  .env created at: $ENV_FILE"
  echo "  │                                                     │"
  echo "  │  Edit it and set your AviationStack API key:        │"
  echo "  │    AVIATIONSTACK_API_KEY=your_key_here              │"
  echo "  │                                                     │"
  echo "  │  Get a free key at: https://aviationstack.com       │"
  echo "  │                                                     │"
  echo "  │  Then re-run:  bash deploy.sh                       │"
  echo "  └─────────────────────────────────────────────────────┘"
  echo ""
  exit 0
fi

# Check the key is not still the placeholder
if grep -q "your_key_here" "$ENV_FILE"; then
  echo "  ✗ AVIATIONSTACK_API_KEY is still set to the placeholder."
  echo "  Edit $ENV_FILE and replace 'your_key_here' with your real key."
  echo "  Then re-run:  bash deploy.sh"
  echo ""
  exit 1
fi

echo "  ✓ .env present and configured"
echo ""

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "▶ Step 1/4 — Updating source code..."
cd "$BASE_DIR/$REPO_DIR"
git pull
echo "  ✓ Source up to date"

# ── 2. Build Docker image ─────────────────────────────────────────────────────
echo ""
echo "▶ Step 2/4 — Building Docker image..."
cd "$BASE_DIR/$REPO_DIR"
sudo docker build -t "$IMAGE_NAME" .
echo "  ✓ Image built"

# ── 3. Stop + remove old container ───────────────────────────────────────────
echo ""
echo "▶ Step 3/4 — Replacing container..."
sudo docker stop "$CONTAINER_NAME" 2>/dev/null && echo "  Stopped old container" || echo "  No running container found"
sudo docker rm   "$CONTAINER_NAME" 2>/dev/null && echo "  Removed old container" || true

# ── 4. Start new container ────────────────────────────────────────────────────
echo ""
echo "▶ Step 4/4 — Starting new container..."
sudo docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$HOST_PORT":3000 \
  -v "$BASE_DIR/data:/app/data" \
  --env-file "$ENV_FILE" \
  "$IMAGE_NAME"

echo "  ✓ Container started"
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  🌐 http://$(hostname -I | awk '{print $1}'):$HOST_PORT"
echo "══════════════════════════════════════════"
echo ""
