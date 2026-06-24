FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# 安装所有依赖（根目录 + server workspace）
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/
RUN pnpm install

# 复制源代码
COPY . ./

# 构建前端
RUN npx taro build --type h5

# 构建后端
RUN cd server && npx nest build

EXPOSE 3000

CMD ["node", "server/dist/main.js"]