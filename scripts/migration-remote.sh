#!/usr/bin/env bash
#
# SGV Web Đông Dương — Drizzle Migration trên DB REMOTE qua SSH Tunnel
#
# MỌI thông tin (VPS + DB remote) do NGƯỜI DÙNG NHẬP — Có giá trị mặc định, Enter để chọn.
# Hỗ trợ:
#   (1) Run migration đang chờ trong thư mục drizzle/ lên DB REMOTE;
#   (2) Generate migration MỚI từ diff TypeScript schema (db/schemas/) ↔ DB REMOTE;
#   (3) Push trực tiếp schema TypeScript vào DB REMOTE (có xem trước DDL và xác nhận);
#   (4) Kiểm tra trạng thái DB & bảng (status).
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " R; printf '%s' "${R:-$1}"; }
asks() { read -rsp "$1: " R; echo >&2; printf '%s' "$R"; }

# Bỏ mọi DB_* kế thừa từ môi trường để ưu tiên giá trị người dùng nhập
unset DATABASE_URL DB_CONNECTION DB_HOST DB_PORT DB_USER DB_NAME DB_PASSWORD 2>/dev/null || true

echo "=================================================================="
echo "  🚀 SGV Web Đông Dương — Drizzle Migration Remote qua SSH Tunnel"
echo "=================================================================="
VPS_HOST="$(ask 14.241.237.132 '🌐 VPS Host (IP/domain)')"
[ -n "$VPS_HOST" ] || { echo "❌ Thiếu VPS host"; exit 1; }

VPS_USER="$(ask sgv '👤 VPS User')"
REMOTE_PG_PORT="$(ask 5435 '🔌 Remote postgres port (sgv_postgres host port)')"
DB_USER="$(ask postgres '👤 Remote DB user')"
DB_NAME="$(ask sgv_cms '🗄️  Remote DB name')"
DB_PASSWORD="$(asks '🔑 Remote DB password (Enter nếu không dùng/đã có trust)')"

LPORT=15435
SOCK="/tmp/ssh-sgv-drizzle-$$"
cleanup() {
  echo ""
  echo "🔌 Đang đóng SSH tunnel..."
  ssh -o ControlPath="$SOCK" -O exit "$VPS_USER@$VPS_HOST" 2>/dev/null || true
  rm -f "$SOCK"
}
trap cleanup EXIT

echo "🔌 Đang mở SSH tunnel 127.0.0.1:$LPORT → (VPS) localhost:$REMOTE_PG_PORT ..."
ssh -o ControlMaster=yes -o ControlPath="$SOCK" -o ControlPersist=120 \
    -fNL "$LPORT:localhost:$REMOTE_PG_PORT" "$VPS_USER@$VPS_HOST" \
  || { echo "❌ Không mở được SSH tunnel. Vui lòng kiểm tra SSH host/user/mật khẩu!"; exit 1; }

if [ -n "$DB_PASSWORD" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${LPORT}/${DB_NAME}?sslmode=disable"
else
  export DATABASE_URL="postgresql://${DB_USER}@127.0.0.1:${LPORT}/${DB_NAME}?sslmode=disable"
fi

echo ""
echo "=================================================================="
echo "🎯 Chọn thao tác migration cần thực hiện trên DB REMOTE:"
echo "   1) 🔄 Run pending migrations (Chạy các file .sql trong drizzle/)"
echo "   2) 🧬 Generate migration mới (So sánh schema TypeScript ↔ DB Remote)"
echo "   3) ⚡ Drizzle Push (Đồng bộ trực tiếp thay đổi bảng/cột vào DB)"
echo "   4) 📋 Kiểm tra trạng thái DB & danh sách bảng (Status)"
echo "=================================================================="
read -rp "👉 Chọn [1-4] (mặc định: 3): " ACTION
ACTION="${ACTION:-3}"

case "$ACTION" in
  1)
    echo "▶️  Đang chạy các migration đang chờ trên REMOTE ($DB_NAME @ $VPS_HOST:$REMOTE_PG_PORT)..."
    node scripts/drizzle-migrator.js migrate
    ;;

  2)
    read -rp "📝 Tên migration mới (ví dụ: add_products_field): " M_NAME
    if [ -z "$M_NAME" ]; then
      echo "❌ Thiếu tên migration!"; exit 1;
    fi
    echo "🧬 Đang generate migration '$M_NAME' từ diff schema ↔ DB REMOTE..."
    npx drizzle-kit generate --name "$M_NAME"
    echo ""
    NEW_FILE="$(ls -t drizzle/*"$M_NAME"*.sql 2>/dev/null | head -1 || true)"
    if [ -n "$NEW_FILE" ] && [ -f "$NEW_FILE" ]; then
      echo "✅ ĐÃ TẠO FILE MIGRATION: $NEW_FILE"
      echo "--- Nội dung file SQL vừa tạo ---"
      cat "$NEW_FILE"
      echo "---------------------------------"
      read -rp "⚠️  Áp migration này lên DB REMOTE ngay bây giờ? (gõ đúng 'yes' để chạy): " CONFIRM
      if [ "$CONFIRM" = "yes" ]; then
        echo "▶️  Đang áp migration vừa tạo lên REMOTE..."
        node scripts/drizzle-migrator.js migrate
        echo "✅ Đã áp migration mới lên REMOTE thành công!"
      else
        echo "⏸️  Chưa áp lên DB. Bạn có thể review kỹ file $NEW_FILE rồi chạy lại 'make migration-remote' (chọn 1) để áp."
      fi
    else
      echo "ℹ️  Không có thay đổi mới nào so với schema hiện tại."
    fi
    ;;

  3)
    echo "⚡ Drizzle Push: So sánh trực tiếp bảng & cột từ TypeScript với DB REMOTE..."
    echo "⚠️  Lưu ý: Drizzle push sẽ kiểm tra và hiển thị các lệnh ALTER TABLE / ADD COLUMN / CREATE TABLE."
    read -rp "Tiếp tục chạy Drizzle push trên DB REMOTE? (gõ 'yes' để tiếp tục): " CONFIRM_PUSH
    if [ "$CONFIRM_PUSH" = "yes" ]; then
      npx drizzle-kit push
      echo "✅ Drizzle push hoàn tất trên REMOTE!"
    else
      echo "Đã hủy Drizzle push."
    fi
    ;;

  4)
    node scripts/drizzle-migrator.js status
    ;;

  *)
    echo "❌ Lựa chọn không hợp lệ."
    exit 1
    ;;
esac

echo ""
echo "=================================================================="
echo "✅ Hoàn tất thao tác trên DB Remote ($DB_NAME @ $VPS_HOST)!"
echo "=================================================================="
