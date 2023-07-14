FROM --platform=linux/amd64 node:11.15


# Use the official Node.js 14 image as the base
FROM node:alpine

# create application directory
RUN mkdir -p /usr/src/server

# Set the working directory in the container
WORKDIR /usr/src/server

# Copy package.json and package-lock.json to the working directory
COPY package.json /usr/src/server/

# Install project dependencies
RUN npm install

# Copy all project files to the working directory
COPY . /usr/src/server

# Expose the container port
EXPOSE 3000

# Start the server
CMD [ "node", "server.js" ]
