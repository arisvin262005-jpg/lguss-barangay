FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directory for PouchDB data persistence
RUN mkdir -p /app/bims_db

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the server
CMD ["node", "server.js"]
