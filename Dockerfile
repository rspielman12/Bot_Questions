# Use Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Copy files
COPY package.json ./
COPY server.js ./
COPY public ./public

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
