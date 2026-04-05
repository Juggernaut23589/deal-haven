FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# ─── Dependencies ───
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ─── Build ───
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Runtime ───
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/uploads && chown -R api:nodejs /app/uploads
VOLUME ["/app/uploads"]

USER api
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
