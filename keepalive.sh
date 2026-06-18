#!/bin/bash
# 自动保活脚本 - 生产模式，每2分钟检测，挂了秒级恢复
LOG_FILE="/tmp/keepalive.log"
PUBLIC_URL="https://0e07124b-4731-423f-ba65-0cd83e5b6339.dev.coze.site"
PROJECT_DIR="/workspace/projects"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

start_prod() {
  # 清理所有旧进程
  ps aux | grep -E "taro build.*watch|nest.*watch|concurrently|pnpm dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
  fuser -k 5000/tcp 2>/dev/null; fuser -k 3000/tcp 2>/dev/null
  sleep 2
  
  # 确保前端构建产物存在
  if [ ! -f "$PROJECT_DIR/dist-web/index.html" ]; then
    log "⏳ 前端产物缺失，重新构建..."
    cd "$PROJECT_DIR" && npx taro build --type h5 2>&1 | tail -1
  fi
  
  # 启动生产模式（单端口，NestJS 同时服务 API + 前端）
  cd "$PROJECT_DIR" && SERVER_PORT=5000 node server/dist/main.js &
  
  # 等待就绪
  for i in $(seq 1 15); do
    if curl -s --max-time 2 http://localhost:5000/api/health > /dev/null 2>&1; then
      log "✅ 服务已恢复 (端口 5000)"
      return 0
    fi
    sleep 1
  done
  
  log "❌ 启动失败"
  return 1
}

log "🚀 保活脚本启动 (生产模式)"

# 启动后先确保服务在线
if ! curl -s --max-time 3 http://localhost:5000/api/health > /dev/null 2>&1; then
  log "⚠️ 初始检测服务不在线，启动中..."
  start_prod
fi

while true; do
  if curl -s --max-time 5 http://localhost:5000/api/health > /dev/null 2>&1; then
    # 服务正常，ping 一下公网保持活跃
    curl -s --max-time 5 "$PUBLIC_URL" > /dev/null 2>&1
    log "✅ 正常"
  else
    log "⚠️ 检测到服务异常，重启中..."
    start_prod
  fi
  
  SLEEP_TIME=$((60 + RANDOM % 60))
  sleep "$SLEEP_TIME"
done