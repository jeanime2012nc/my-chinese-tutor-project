#!/bin/bash
# 一键快速重启 - 生产模式，10秒内恢复
PROJECT_DIR="/workspace/projects"

echo "🔄 清理旧进程..."
ps aux | grep -E "taro build.*watch|nest.*watch|concurrently|pnpm dev|keepalive" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
fuser -k 5000/tcp 2>/dev/null; fuser -k 3000/tcp 2>/dev/null
sleep 3

echo "✅ 启动生产模式..."
cd "$PROJECT_DIR" && SERVER_PORT=5000 node server/dist/main.js &
echo "⏳ 等待就绪..."

for i in $(seq 1 10); do
  sleep 1
  if curl -s --max-time 2 http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ 服务已恢复！"
    echo "   http://localhost:5000"
    echo "   https://0e07124b-4731-423f-ba65-0cd83e5b6339.dev.coze.site"
    
    # 启动保活
    setsid "$PROJECT_DIR/keepalive.sh" > /dev/null 2>&1 &
    echo "🛡️ 保活脚本已启动"
    exit 0
  fi
done

echo "❌ 启动失败，请检查日志"