#!/bin/bash
set -e

# 智能辅导 - 一键启动脚本
# 自动检测前端构建产物，缺失则重建，然后启动服务

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="/tmp/coze-logs"
mkdir -p "$LOG_DIR"

echo "=== 智能辅导 启动中 ==="

# 1. 检查前端构建产物
if [ ! -f "$SCRIPT_DIR/dist-web/index.html" ]; then
  echo "[1/3] 前端构建产物缺失，重新构建 H5..."
  cd "$SCRIPT_DIR"
  pnpm build --web > "$LOG_DIR/build.log" 2>&1
  if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败，查看日志: $LOG_DIR/build.log"
    exit 1
  fi
  echo "✅ 前端构建完成"
else
  echo "[1/3] 前端构建产物存在 ✅"
fi

# 2. 确保后端已构建
if [ ! -f "$SCRIPT_DIR/server/dist/main.js" ]; then
  echo "[2/3] 后端构建产物缺失，重新构建..."
  cd "$SCRIPT_DIR/server"
  npm run build > "$LOG_DIR/server-build.log" 2>&1
  if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败"
    exit 1
  fi
  echo "✅ 后端构建完成"
else
  echo "[2/3] 后端构建产物存在 ✅"
fi

# 3. 清理旧进程，启动服务
echo "[3/3] 启动服务..."
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

cd "$SCRIPT_DIR/server"
nohup node dist/main.js > "$LOG_DIR/server.log" 2>&1 &
sleep 3

# 验证
if ss -tuln 2>/dev/null | grep -q ':3000'; then
  echo "✅ 服务启动成功！端口: 3000"
  echo "   公网地址: https://0e07124b-4731-423f-ba65-0cd83e5b6339.dev.coze.site"
else
  echo "❌ 服务启动失败，查看日志: $LOG_DIR/server.log"
  tail -20 "$LOG_DIR/server.log"
  exit 1
fi