# Production Dockerfile for Ace it! Backend
# Optimized for Google Cloud Run (asia-east2 - Hong Kong)

FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install Node.js production dependencies.
RUN npm install --omit=dev

# Copy local code to the container image.
COPY . ./

# Expose the port the app runs on.
EXPOSE 3001

# Run the web service on container startup.
CMD [ "node", "server.js" ]
