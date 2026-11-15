# ==============================================================================
# DeployFlow Backend - Production Dockerfile
# Optimized for Node.js LTS Alpine & Render Docker Web Service deployment
# ==============================================================================

FROM node:20-alpine AS base

# Install security updates and dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY src ./src

# Create non-root user security context (node user exists in official node alpine image)
USER node

# Expose default application port
EXPOSE 5000

# Use dumb-init to handle termination signals properly in containers
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the Express server
CMD ["node", "src/server.js"]
