FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl openssl1.1-compat
WORKDIR /app

# Prisma files must be copied
COPY prisma/ /app/prisma/

# Create the nodejs group and nextjs user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 --ingroup nextjs nextjs

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL and its compatibility package
RUN apk add --no-cache openssl openssl1.1-compat

# Copy the public folder
COPY ./public /app/public

# Create the nodejs group and nextjs user in the runner stage
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 --ingroup nextjs nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nextjs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]