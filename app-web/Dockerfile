# Étape 1 : build Angular
FROM node:18-alpine AS build
WORKDIR /app

# Ne copier que package*.json pour profiter du cache Docker
COPY app-web/package*.json ./
RUN npm ci

# Copier le reste et builder
COPY app-web/ ./
RUN npm run build -- --output-path=dist

# Étape 2 : servir avec Nginx
FROM nginx:alpine
# Supprimer la configuration par défaut si besoin
RUN rm /etc/nginx/conf.d/default.conf

# Copier la conf personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --spider http://localhost/ || exit 1
