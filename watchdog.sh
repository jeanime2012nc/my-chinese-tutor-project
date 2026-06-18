#!/bin/bash
# 智能辅导 - 自动保活守护进程
# 每2分钟检查一次服务状态，挂了自动重启

LOG_DIR="/tmp/coze-logs"
mkdir -p "$LOG_DIR"
PROJECT_DIR="/workspace/projects"

echo "[守护] 启动监控，每2分钟检查一次" >> "$LOG_DIR/watchdog.log"

while true; do
  # 检查后端服务是否在监听
  if ! ss -tuln 2>/dev/null | grep -q ':3000'; then
    echo "[$(date '+%H:%M:%S')] ❌ 服务停止，尝试重启..." >> "$LOG_DIR/watchdog.log"

    # 检查前端构建产物
    if [ ! -f "$PROJECT_DIR/dist-web/index.html" ]; then
      echo "  → 前端产物缺失，重新构建" >> "$LOG_DIR/watchdog.log"
      cd "$PROJECT_DIR" && pnpm build --web > "$LOG_DIR/build.log" 2>&1
    fi

    # 检查后端构建产物
    if [ ! -f "$PROJECT_DIR/server/dist/main.js" ]; then
      echo "  → 后端产物缺失，重新构建" >> "$LOG_DIR/watchdog.log"
      cd "$PROJECT_DIR/server" && npm run build > "$LOG_DIR/server-build.log" 2>&1
    fi

    # 启动服务
    fuser -k 3000/tcp 2>/dev/null || true
    cd "$PROJECT_DIR/server"
    nohup node dist/main.js > "$LOG_DIR/server.log" 2>&1 &
    sleep 5

    if ss -tuln 2>/dev/null | grep -q ':3000'; then
      echo "  ✅ 重启成功 $(date '+%H:%M:%S')" >> "$LOG_DIR/watchdog.log"
    else
      echo "  ❌ 重启失败" >> "$LOG_DIR/watchdog.log"
    fi
  fi

  sleep 120  # 每2分钟检查一次
done