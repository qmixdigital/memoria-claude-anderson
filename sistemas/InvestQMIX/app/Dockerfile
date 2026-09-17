# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY db/package.json ./db/
COPY worker/package.json ./worker/
RUN npm ci --workspace=app --workspace=db --include-workspace-root

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY db/package.json ./db/
COPY worker/package.json ./worker/
COPY tsconfig.base.json ./
COPY db/src ./db/src
COPY db/tsconfig.json ./db/
COPY app/ ./app/
ARG APP_VERSION=dev
ENV DATABASE_URL=<<REMOVIDO>>
ENV APP_VERSION=$APP_VERSION
RUN npm --workspace db run build
RUN npm --workspace app run build

# ---- runtime stage (Next.js standalone) ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
USER app

# Standalone do Next coloca tudo em .next/standalone com server.js na raiz
COPY --from=build --chown=app:app /app/app/.next/standalone ./
COPY --from=build --chown=app:app /app/app/.next/static ./app/.next/static
COPY --from=build --chown=app:app /app/app/public ./app/public

EXPOSE 3000
CMD ["node", "app/server.js"]
