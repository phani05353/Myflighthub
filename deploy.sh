#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# MyFlightHub — homelab deploy script
# Run from anywhere inside the repo:  ./deploy.sh
#
# Layout (deploy.sh lives in the repo root):
#   myflighthub/
#   ├── deploy.sh      ← this script
#   ├── .env           ← created on first run; edit before re-running
#   ├── data/          ← SQLite DB lives here (gitignored, never deleted)
#   └── ...            ← rest of repo
# ─────────────────────────────────────────────────────────────────────────────
set -e

IMAGE_NAME="flighthub"
CONTAINER_NAME="flighthub"
HOST_PORT="8090"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$REPO_DIR/.env"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   MyFlightHub — Deploy              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 0. Ensure .env exists and is configured ───────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "▶ Step 0 — First run detected. Creating .env from template..."
  cp "$REPO_DIR/.env.example" "$ENV_FILE"
  echo ""
  echo "  ┌─────────────────────────────────────────────────────┐"
  echo "  │  .env created at: $ENV_FILE"
  echo "  │                                                     │"
  echo "  │  Edit it and set your AviationStack API key:        │"
  echo "  │    AVIATIONSTACK_API_KEY=your_key_here              │"
  echo "  │                                                     │"
  echo "  │  Get a free key at: https://aviationstack.com       │"
  echo "  │                                                     │"
  echo "  │  Then re-run:  ./deploy.sh                          │"
  echo "  └─────────────────────────────────────────────────────┘"
  echo ""
  exit 0
fi

if grep -q "your_key_here" "$ENV_FILE"; then
  echo "  ✗ AVIATIONSTACK_API_KEY is still set to the placeholder."
  echo "  Edit $ENV_FILE and replace 'your_key_here' with your real key."
  echo "  Then re-run:  ./deploy.sh"
  echo ""
  exit 1
fi

echo "  ✓ .env present and configured"
echo ""

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "▶ Step 1/4 — Updating source code..."
cd "$REPO_DIR"
git pull
echo "  ✓ Source up to date"

# ── 2. Build Docker image ─────────────────────────────────────────────────────
echo ""
echo "▶ Step 2/4 — Building Docker image..."
sudo docker build -t "$IMAGE_NAME" "$REPO_DIR"
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
  -v "$REPO_DIR/data:/app/data" \
  --env-file "$ENV_FILE" \
  "$IMAGE_NAME"

echo "  ✓ Container started"
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  🌐 http://$(hostname -I | awk '{print $1}'):$HOST_PORT"
echo "══════════════════════════════════════════"
echo ""
