# Étape 1: Build Angular
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY web .
RUN npm run build --prod

# Étape 2: Serveur Nginx
FROM nginx:latest
COPY --from=build /app/dist/angular-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
