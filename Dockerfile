# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Final stage - just for artifact output
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/dist ./dist
