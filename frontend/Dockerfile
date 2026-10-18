# syntax=docker/dockerfile:1
# ── Frontend: Nuxt 4 (Bun build → Node/Nitro runtime) ──────────────────
# Multi-stage: lockfile install + nuxt build → minimal Nitro server image.
# Build context: ./frontend
#   docker build -t e-math-frontend:local ./frontend
#
# NUXT_PUBLIC_API_BASE is a runtime env var (Nitro overrides runtimeConfig
# at start-up) — it does NOT need to be passed at build time.

ARG BUN_VERSION=1.4.3
ARG NODE_VERSION=22.22.2

# ── Stage 1: install + build ───────────────────────────────────────────
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ── Stage 2: runtime (Nitro node-server preset) ────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime

LABEL org.opencontainers.image.title="e-learning-math-frontend" \
      org.opencontainers.image.description="E-Learning Math frontend (Nuxt 4 / Nitro)" \
      org.opencontainers.image.source="https://github.com/muhammad2341/E-Math-Learning"

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Only the compiled .output bundle — no source, node_modules, or dev files
COPY --from=build --chown=node:node /app/.output ./.output

# Non-root runtime user provided by the node image (uid 1000)
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1

STOPSIGNAL SIGTERM

CMD ["node", ".output/server/index.mjs"]
