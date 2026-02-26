# syntax=docker/dockerfile:1.4

FROM node:24.10.0-bookworm-slim AS vitepress-builder
WORKDIR /src

COPY . .
RUN npm install
RUN npm run docs:build

FROM nginx:1.29.2-alpine-slim AS nginx-spa
COPY --from=vitepress-builder /src/.vitepress/vitepress.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=vitepress-builder /src/.vitepress/dist /etc/share/nginx/html
COPY --from=vitepress-builder /src/public /etc/share/nginx/html
EXPOSE 80
