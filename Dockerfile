FROM node:18-alpine3.17 as builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR app

# COPY package.json and lock file
COPY package.json .
# Install dependencies
RUN pnpm install

# Copy source code and build
COPY . .
RUN pnpm build

# Use the official Nginx image as your base image
FROM nginx:latest as server

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built assets from the builder container
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
