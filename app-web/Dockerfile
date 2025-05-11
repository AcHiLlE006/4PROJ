# Build Angular
FROM node:18-alpine AS build
WORKDIR /app

# Ne copier que package*.json pour profiter du cache Docker
COPY ./package*.json ./
RUN npm ci

# Copier le reste et builder
COPY .env .env
COPY . ./

RUN npm run build -- --output-path=dist

FROM nginx:alpine

# Supprimer la conf d’example
RUN rm /etc/nginx/conf.d/default.conf

# Copier la conf qui ne contient QUE le bloc `server`
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80


EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --spider http://localhost/ || exit 1
