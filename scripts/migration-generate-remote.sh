#!/usr/bin/env bash
#
# SGV Web Đông Dương — CHỈ GENERATE file migration .sql từ diff schema ↔ DB REMOTE.
# Hoàn toàn READ-ONLY với DB Remote — KHÔNG ghi hay làm thay đổi dữ liệu trên server.
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " R; printf '%s' "${R:-$1}"; }
asks() { read -rsp "$1: " R; echo >&2; printf '%s' "$R"; }

unset DATABASE_URL DB_CONNECTION DB_HOST DB_PORT DB_USER DB_NAME DB_PASSWORD 2>/dev/null || true

echo "=================================================================="
echo "  🧬 Drizzle Migration: GENERATE ONLY từ diff DB REMOTE"
echo "  (Chỉ tạo file .sql tại local, KHÔNG áp dụng gì lên DB)"
echo "=================================================================="
VPS_HOST="$(ask 14.241.237.132 '🌐 VPS Host (IP/domain)')"
[ -n "$VPS_HOST" ] || { echo "❌ Thiếu VPS host"; exit 1; }

VPS_USER="$(ask sgv '👤 VPS User')"
REMOTE_PG_PORT="$(ask 5435 '🔌 Remote postgres port (sgv_postgres host port)')"
DB_USER="$(ask postgres '👤 Remote DB user')"
DB_NAME="$(ask sgv_cms '🗄️  Remote DB name')"
DB_PASSWORD="$(asks '🔑 Remote DB password')"

read -rp "📝 Tên migration mới (bắt buộc, ví dụ: update_news_fields): " M_NAME
[ -n "$M_NAME" ] || { echo "❌ Thiếu tên migration!"; exit 1; }

LPORT=15435
SOCK="/tmp/ssh-sgv-gen-$$"
cleanup() {
  echo ""
  echo "🔌 Đang đóng SSH tunnel..."
  ssh -o ControlPath="$SOCK" -O exit "$VPS_USER@$VPS_HOST" 2>/dev/null || true
  rm -f "$SOCK"
}
trap cleanup EXIT

echo "🔌 Mở SSH tunnel 127.0.0.1:$LPORT → (VPS) localhost:$REMOTE_PG_PORT ..."
ssh -o ControlMaster=yes -o ControlPath="$SOCK" -o ControlPersist=120 \
    -fNL "$LPORT:localhost:$REMOTE_PG_PORT" "$VPS_USER@$VPS_HOST" \
  || { echo "❌ Không mở được SSH tunnel"; exit 1; }

if [ -n "$DB_PASSWORD" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${LPORT}/${DB_NAME}?sslmode=disable"
else
  export DATABASE_URL="postgresql://${DB_USER}@127.0.0.1:${LPORT}/${DB_NAME}?sslmode=disable"
fi

echo "🧬 Đang so sánh schema TypeScript với DB REMOTE ($DB_NAME @ $VPS_HOST)..."
npx drizzle-kit generate --name "$M_NAME"

NEW_FILE="$(ls -t drizzle/*"$M_NAME"*.sql 2>/dev/null | head -1 || true)"
if [ -n "$NEW_FILE" ] && [ -f "$NEW_FILE" ]; then
  echo ""
  echo "=================================================================="
  echo "✅ ĐÃ TẠO THÀNH CÔNG FILE MIGRATION:"
  echo "   📄 $NEW_FILE"
  echo "=================================================================="
  echo "--- Nội dung SQL ---"
  cat "$NEW_FILE"
  echo "--------------------"
  echo "ℹ️  File này chưa được áp lên DB."
  echo "   Bạn có thể mở kiểm tra, chỉnh sửa nếu cần, rồi dùng lệnh:"
  echo "   make migration-remote (chọn 1) để áp dụng."
else
  echo "ℹ️  Không có thay đổi để generate (DB đã khớp với code schema)."
fi
