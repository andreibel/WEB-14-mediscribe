# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────────────────────────────────────
# Next.js 16 production image — multi-stage, standalone output, non-root runtime.
#   deps  → install dependencies once (cached)
#   build → compile the app into .next/standalone
#   runner → minimal image that runs server.js
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22-alpine

# ── 1. Dependencies ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Install from lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build
WORKDIR /app

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# must be present here. Render passes service env vars as build args automatically;
# we promote them to env vars so `next build` can read them.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── 3. Runner ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Render sets $PORT; bind to it and listen on all interfaces.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + the assets it does NOT bundle (static chunks + public/).
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
