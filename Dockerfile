FROM node:20-alpine AS builder

WORKDIR /app

# 1. 安装 pnpm
RUN npm install -g pnpm

# 2. 安装前端依赖并构建
COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY config ./config
COPY babel.config.js tsconfig.json project.config.js ./
RUN pnpm install
RUN npx taro build --type h5

# 3. 安装后端依赖并构建
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# 4. 生产镜像
FROM node:20-alpine

WORKDIR /app

# 复制前端产物
COPY --from=builder /app/dist-web ./dist-web

# 复制后端产物
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json

EXPOSE 3000

CMD ["node", "server/dist/main.js"]