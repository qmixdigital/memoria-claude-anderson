# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY worker/package.json ./worker/
COPY db/package.json ./db/
COPY app/package.json ./app/
RUN npm ci --workspace=worker --workspace=db --include-workspace-root

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY worker/package.json ./worker/
COPY db/package.json ./db/
COPY tsconfig.base.json ./
COPY worker/tsconfig.json ./worker/
COPY worker/src ./worker/src
COPY db/src ./db/src
COPY db/migrations ./db/migrations
COPY db/tsconfig.json ./db/
RUN npm --workspace db run build
RUN npm --workspace worker run build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# uid:gid nao-root
RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
USER app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/worker/dist ./worker/dist
COPY --from=build --chown=app:app /app/db/migrations ./db/migrations
COPY --from=build --chown=app:app /app/db/dist ./db/dist
COPY --chown=app:app worker/package.json ./worker/
COPY --chown=app:app db/package.json ./db/
COPY --chown=app:app package.json ./

CMD ["node", "worker/dist/index.js"]
