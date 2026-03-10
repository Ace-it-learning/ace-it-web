# Production Dockerfile for Ace it! Backend
# Optimized for Google Cloud Run (asia-east2 - Hong Kong)

FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
# If you have a package-lock.json, speed up the build with `npm ci`
RUN npm install --omit=dev

# Copy local code to the container image.
COPY . ./

# Expose the port the app runs on.
EXPOSE 3001

# Run the web service on container startup.
# Cloud Run sets the PORT environment variable.
CMD [ "node", "server.js" ]
