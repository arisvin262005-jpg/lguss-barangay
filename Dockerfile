FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy ONLY backend package files first
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy the rest of the backend code
COPY backend/ ./

# Create local DB folder
RUN mkdir -p /app/bims_db

EXPOSE 5000

# Start server
CMD ["node", "server.js"]
