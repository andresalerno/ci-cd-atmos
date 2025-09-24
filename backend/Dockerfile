FROM node:18-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm i --production=false

COPY src ./src

EXPOSE 3000
CMD ["npm", "start"]

