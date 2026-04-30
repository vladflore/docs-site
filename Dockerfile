FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY antora-playbook.yml ./antora-playbook.yml
COPY supplemental-ui/ ./supplemental-ui/
COPY lib/ ./lib/

RUN npx antora --fetch antora-playbook.yml

FROM nginx:alpine AS server
COPY --from=builder /app/build/site /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
