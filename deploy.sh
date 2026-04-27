#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# MyFlightHub — homelab deploy script
#
# Works in two layouts:
#   A) Script lives inside the cloned repo (dev / CI):
#      myflighthub/
#      ├── .git/
#      ├── deploy.sh      ← here
#      └── ...
#
#   B) Script copied to a bare deploy dir (homelab first-time):
#      myflighthub/
#      ├── deploy.sh      ← here (no .git)
#      ├── .env           ← created on first run
#      ├── data/          ← SQLite DB (never deleted)
#      └── src/           ← repo auto-cloned here
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/phani05353/myflighthub"
IMAGE_NAME="flighthub"
CONTAINER_NAME="flighthub"
HOST_PORT="8090"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   MyFlightHub — Deploy              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Resolve repo root (layout A or B) ────────────────────────────────────────
if git -C "$SCRIPT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  # Layout A — script is inside the repo
  REPO_DIR="$SCRIPT_DIR"
else
  # Layout B — script is in a bare deploy dir; repo lives in src/
  REPO_DIR="$SCRIPT_DIR/src"
  if [ -d "$REPO_DIR/.git" ]; then
    echo "▶ Updating source code..."
    git -C "$REPO_DIR" pull
    echo "  ✓ Source up to date"
  else
    echo "▶ Cloning repo into src/..."
    git clone "$REPO_URL" "$REPO_DIR"
    echo "  ✓ Repo cloned"
  fi
  echo ""
fi

# ── 0. Ensure .env exists and is configured ───────────────────────────────────
ENV_FILE="$SCRIPT_DIR/.env"

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

# ── 1. Pull latest code (layout A only — layout B already pulled above) ───────
if git -C "$SCRIPT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  echo "▶ Step 1/4 — Updating source code..."
  git -C "$REPO_DIR" pull
  echo "  ✓ Source up to date"
  echo ""
fi

# ── 2. Build Docker image ─────────────────────────────────────────────────────
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
  -v "$SCRIPT_DIR/data:/app/data" \
  --env-file "$ENV_FILE" \
  "$IMAGE_NAME"

echo "  ✓ Container started"
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  🌐 http://$(hostname -I | awk '{print $1}'):$HOST_PORT"
echo "══════════════════════════════════════════"
echo ""
