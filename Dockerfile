FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ----------------------------
# Stage 1: Install all deps
# ----------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ----------------------------
# Stage 2: Build
# ----------------------------
FROM deps AS build
WORKDIR /app
COPY . .
RUN node ace build

# ----------------------------
# Stage 3: Production dependencies
# ----------------------------
FROM base AS prod-deps
WORKDIR /app
COPY --from=build /app/build/package.json ./
COPY --from=build /app/build/pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# ----------------------------
# Stage 4: Production runtime
# ----------------------------
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY docker-entrypoint.js ./

EXPOSE 3333
CMD ["node", "docker-entrypoint.js"]
