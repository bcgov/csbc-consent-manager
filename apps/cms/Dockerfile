FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY apps/cms/package.json ./apps/cms/package.json

RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/cms ./apps/cms

# Install the correct sharp prebuilt binary for Alpine (linux-musl)
RUN npm install --os=linux --libc=musl sharp --workspace=apps/cms

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=apps/cms

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/apps/cms/.next/standalone ./
COPY --from=builder /app/apps/cms/.next/static ./apps/cms/.next/static

# OpenShift runs containers with an arbitrary UID in the root group (GID 0).
# Ensure all app files and the .next cache directory are group-writable.
RUN mkdir -p .next && \
    chgrp -R 0 /app && \
    chmod -R g=u /app

USER 1001

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/cms/server.js"]
