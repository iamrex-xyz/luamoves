# Frontend image: build the Vite/React app, serve the static bundle with nginx.
# VITE_* values are compiled INTO the bundle at build time, so they arrive as
# build-args (driven from .env via docker-compose) — never hardcoded here.

# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install all deps (incl. devDependencies — vite + lovable-tagger are needed to
# build; do NOT set NODE_ENV=production here or they'd be skipped).
# .npmrc sets legacy-peer-deps to clear the template's capacitor peer conflict.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Source, then bake the env. Vite reads .env.production.local at build time and
# it wins over any committed .env file, so this is the single source of truth.
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
RUN printf 'VITE_API_BASE_URL=%s\nVITE_SUPABASE_URL=%s\nVITE_SUPABASE_PROJECT_ID=%s\nVITE_SUPABASE_PUBLISHABLE_KEY=%s\n' \
    "$VITE_API_BASE_URL" "$VITE_SUPABASE_URL" "$VITE_SUPABASE_PROJECT_ID" "$VITE_SUPABASE_PUBLISHABLE_KEY" \
    > .env.production.local \
 && npm run build

# --- runtime stage ---
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
