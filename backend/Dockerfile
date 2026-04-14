FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
RUN npm prune --omit=dev

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY src ./src
COPY uploads ./uploads

EXPOSE 3001

CMD ["node", "src/server.js"]