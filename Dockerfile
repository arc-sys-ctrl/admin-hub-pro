# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=
ARG VITE_ENABLE_AUTH=true
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_AUTH=$VITE_ENABLE_AUTH

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
