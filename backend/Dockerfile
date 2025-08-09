# Use the official Node.js image
FROM node:18

# Install netcat for wait-for-mysql.sh script
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*



# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including nodemon)
RUN npm install -g nodemon \
    && npm install

# Copy the full app source
COPY . .

# Make wait script executable
RUN chmod +x ./wait-for-mysql.sh

# Expose the app port
EXPOSE 3000

# Optional (your docker-compose.yml already overrides this)
CMD ["npm", "run", "dev"]
