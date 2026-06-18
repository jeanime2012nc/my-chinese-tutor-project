#!/bin/bash
# 自动保活脚本 - 每2分钟检测服务状态，挂了自动重启
# 使用 setsid 脱离终端独立运行

LOG_FILE="/tmp/keepalive.log"
PUBLIC_URL="https://0e07124b-4731-423f-ba65-0cd83e5b6339.dev.coze.site"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

restart_services() {
  log "🔄 服务挂了，尝试重启..."
  
  # 清理旧进程
  fuser -k 5000/tcp 2>/dev/null
  fuser -k 3000/tcp 2>/dev/null
  sleep 3
  
  # 启动 pnpm dev（由 coze dev 管理的前后端）
  cd /workspace/projects
  pnpm dev > /tmp/dev-restart.log 2>&1 &
  
  # 等待后端就绪
  for i in $(seq 1 30); do
    if curl -s --max-time 2 http://localhost:3000/api/health > /dev/null 2>&1; then
      log "✅ 后端已恢复 (3000)"
      break
    fi
    sleep 2
  done
  
  # 等待前端就绪
  for i in $(seq 1 30); do
    if curl -s --max-time 2 http://localhost:5000 > /dev/null 2>&1; then
      log "✅ 前端已恢复 (5000)"
      break
    fi
    sleep 2
  done
}

log "🚀 保活脚本启动"

while true; do
  # 检测本地服务
  if curl -s --max-time 5 http://localhost:5000 > /dev/null 2>&1; then
    # 服务正常，ping 一下保持活跃
    curl -s --max-time 5 "$PUBLIC_URL" > /dev/null 2>&1
    log "✅ 服务正常"
  else
    restart_services
  fi
  
  # 随机等待 60-120 秒，让保活行为不那么规律
  SLEEP_TIME=$((60 + RANDOM % 60))
  sleep "$SLEEP_TIME"
done