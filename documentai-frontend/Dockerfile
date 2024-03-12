# Use node image as a parent image
FROM node 

# Set the working directory
WORKDIR /app 

# Install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["npm", "run", "build"]
