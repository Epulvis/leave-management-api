FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies untuk development)
RUN npm ci

# Copy seluruh source code
COPY . .

# Expose port yang digunakan Adonis
EXPOSE 3333

# Jalankan server dalam mode development (auto-reload)
CMD ["node", "ace", "serve", "--watch"]