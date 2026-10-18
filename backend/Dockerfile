# syntax=docker/dockerfile:1
# ── Backend: Bun + Elysia ──────────────────────────────────────────────
# Multi-stage: reproducible dependency install → minimal runtime image.
# Build context: ./backend
#   docker build -t e-math-backend:local ./backend

ARG BUN_VERSION=1.4.3

# ── Stage 1: production dependencies ───────────────────────────────────
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Reproducible install from the committed lockfile, prod deps only
RUN bun install --frozen-lockfile --production

# ── Stage 2: runtime ───────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION} AS runtime

LABEL org.opencontainers.image.title="e-learning-math-backend" \
      org.opencontainers.image.description="E-Learning Math API (Bun + Elysia)" \
      org.opencontainers.image.source="https://github.com/muhammad2341/E-Math-Learning"

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

# Secrets/config are injected at run time (PORT, MONGODB_URI, JWT_SECRET, CORS_ORIGIN) — never baked in.
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun package.json bun.lock ./
COPY --chown=bun:bun src ./src

# Writable directory for uploaded material files (mount a volume in production)
RUN mkdir -p /app/uploads && chown -R bun:bun /app/uploads

# Run as the non-root "bun" user provided by the base image
USER bun

EXPOSE 3001

# Existing health endpoint: GET /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=35s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

STOPSIGNAL SIGTERM

CMD ["bun", "run", "src/index.ts"]
