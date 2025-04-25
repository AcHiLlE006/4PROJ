# Étape 1 : builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copier et installer deps (seulement prod pour builder)
COPY supmap-api/package*.json ./
RUN npm ci

# Copier le code et builder
COPY supmap-api/ ./
RUN npm run build

# Étape 2 : runtime
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copier uniquement ce qu’il faut
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./


EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --spider http://localhost:${PORT}/health || exit 1

# Démarrage
CMD ["node", "dist/main.js"]
