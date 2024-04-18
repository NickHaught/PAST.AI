# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of your application's code
COPY . .

# Command to run the app using Vite's development server
CMD ["npm", "run", "dev"]

# Expose the port the app runs on
EXPOSE 3000
