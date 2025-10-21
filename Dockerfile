FROM node:20-alpine

# Enable Corepack for package management pnpm
RUN corepack enable 

# Install necessary packages for prisma
RUN apk add --no-cache openssl libc6-compat

# Set working directory and copy necessary files
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY .env.example ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy source code
COPY src ./src

# Build the application
RUN pnpm run build

# Start the application
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]

