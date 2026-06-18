#!/bin/bash
# 一键重启服务 - 智能辅导应用
# 用法: bash start.sh

echo "🔍 清理旧进程..."
fuser -k 5000/tcp 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
sleep 3

echo "📦 检查构建产物..."
if [ ! -d "dist-web" ]; then
  echo "  → 构建前端..."
  npx taro build --type h5 2>&1 | tail -3
fi

if [ ! -d "server/dist" ]; then
  echo "  → 构建后端..."
  cd server && npx nest build 2>&1 | tail -3 && cd ..
fi

echo "🚀 启动开发服务..."
pnpm dev &
DEV_PID=$!
echo "  PID: $DEV_PID (pnpm dev)"

# 等待 NestJS 后端启动
echo "⏳ 等待后端启动..."
for i in $(seq 1 30); do
  if curl -s --max-time 2 http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "  ✅ 后端就绪 (端口 3000)"
    break
  fi
  sleep 2
done

# 等待前端 Vite 启动
echo "⏳ 等待前端启动..."
for i in $(seq 1 30); do
  if curl -s --max-time 2 http://localhost:5000 > /dev/null 2>&1; then
    echo "  ✅ 前端就绪 (端口 5000 / 公网域名)"
    break
  fi
  sleep 2
done

echo ""
echo "==================================="
echo "  服务已恢复！"
echo "  公网地址: https://0e07124b-4731-423f-ba65-0cd83e5b6339.dev.coze.site"
echo "  本地后端: http://localhost:3000"
echo "==================================="
echo ""
echo "💡 注意：Coze 沙箱环境可能自动回收进程。"
echo "   如果打不开，在会话中直接说"重启"即可秒级恢复。"