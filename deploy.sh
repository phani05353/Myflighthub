#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# MyFlightHub — homelab deploy script
# Run from: /home/phanikumar/flighthub/
#
# Layout expected:
#   flighthub/
#   ├── deploy.sh             ← this script
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

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "▶ Step 1/4 — Updating source code..."
if [ -d "$BASE_DIR/$REPO_DIR/.git" ]; then
  cd "$BASE_DIR/$REPO_DIR"
  git pull
else
  echo "  Repo not found — cloning..."
  cd "$BASE_DIR"
  git clone "$REPO_URL" "$REPO_DIR"
fi
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
  --env-file "$BASE_DIR/$REPO_DIR/.env" \
  "$IMAGE_NAME"

echo "  ✓ Container started"
echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Deploy complete!"
echo "  🌐 http://$(hostname -I | awk '{print $1}'):$HOST_PORT"
echo "══════════════════════════════════════════"
echo ""
