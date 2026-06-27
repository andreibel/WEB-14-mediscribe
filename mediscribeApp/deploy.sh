#!/usr/bin/env bash
# Build the linux/amd64 image with the real NEXT_PUBLIC_* values baked in,
# push it to Docker Hub, and verify the Supabase URL actually made it into the
# bundle. Run from the frontend/ directory:  ./deploy.sh
set -euo pipefail

IMAGE="andreinw12/medscribe:latest"
ENV_FILE=".env.local"

# 1. Load the real values into THIS shell.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# 2. Fail loudly if either build-time value is missing — this is what produced
#    the empty-value error on Render.
: "${NEXT_PUBLIC_SUPABASE_URL:?missing in $ENV_FILE}"
: "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:?missing in $ENV_FILE}"
echo "URL  = $NEXT_PUBLIC_SUPABASE_URL"
echo "KEY  = ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:0:8}… (${#NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} chars)"

# 3. Make sure a cross-platform builder is active.
docker buildx inspect amd64builder >/dev/null 2>&1 \
  || docker buildx create --name amd64builder --driver docker-container --use
docker buildx use amd64builder

# 4. Build amd64 + push. --no-cache on the build avoids reusing a stale layer
#    that baked the old/placeholder value.
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -t "$IMAGE" \
  --push .

# 5. Verify arch + that the URL is really inside the pushed image.
echo "== arch =="
docker manifest inspect "$IMAGE" | grep architecture
echo "== baked URL check =="
host="${NEXT_PUBLIC_SUPABASE_URL#https://}"
docker run --rm --platform linux/amd64 --entrypoint sh "$IMAGE" \
  -c "grep -rl '$host' .next/server >/dev/null && echo 'URL baked OK' || echo 'URL MISSING'"

echo "Done. Now redeploy on Render (Manual Deploy → Clear build cache & deploy)."
