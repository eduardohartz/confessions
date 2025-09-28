# Use Node 22 LTS base image
FROM node:22.16.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose the app port (default from .env)
EXPOSE ${PORT}

# Start the app
CMD ["sh", "-c", "npm run start -- -p $PORT"]