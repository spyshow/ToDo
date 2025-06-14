# Use an official Node.js runtime as a parent image
# Using a specific LTS version is good practice, e.g., 18-alpine, 20-alpine
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
# This step is separated to leverage Docker cache for dependencies
COPY package*.json ./

# Install app dependencies
# Using --only=production can reduce image size if devDependencies aren't needed for runtime
# However, for simplicity now, we'll install all.
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
# This should match the port your app listens on (e.g., from .env or default)
EXPOSE 3001

# Define environment variables if they need defaults within the image
# (though these are often better supplied at runtime via docker-compose or -e flags)
# ENV PORT=3001 (Example, if not relying on .env file being present in image)

# Command to run the application
# Using "npm start" is common if you have a start script in package.json
# Otherwise, directly use "node server.js"
CMD [ "node", "server.js" ]
