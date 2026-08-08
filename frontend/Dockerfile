FROM node:20-alpine AS builder

WORKDIR /workspace

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy code
COPY . .

# Build Next.js app
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner
WORKDIR /workspace

ENV NODE_ENV=production

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/.next ./.next
COPY --from=builder /workspace/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
