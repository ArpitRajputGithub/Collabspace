# Production Dockerfile for CollabSpace Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
ENV NODE_ENV=production
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 9000

# Start the server
CMD ["npm", "start"]
