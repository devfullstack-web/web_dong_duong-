#!/usr/bin/env bash
#
# SGV Web Đông Dương — Drizzle Migration trên DB LOCAL
#
# MỌI thông tin do NGƯỜI DÙNG NHẬP — Có giá trị mặc định, Enter để chọn.
# Hỗ trợ:
#   (1) Run migration đang chờ trong thư mục drizzle/ lên DB LOCAL;
#   (2) Generate migration MỚI từ diff TypeScript schema (db/schemas/) ↔ DB LOCAL;
#   (3) Push trực tiếp schema TypeScript vào DB LOCAL (drizzle-kit push);
#   (4) Kiểm tra trạng thái DB & danh sách bảng (Status).
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " R; printf '%s' "${R:-$1}"; }
asks() { read -rsp "$1: " R; echo >&2; printf '%s' "$R"; }

# Bỏ mọi DB_* kế thừa từ môi trường để ưu tiên giá trị người dùng nhập
unset DATABASE_URL DB_CONNECTION DB_HOST DB_PORT DB_USER DB_NAME DB_PASSWORD 2>/dev/null || true

echo "=================================================================="
echo "  💻 SGV Web Đông Dương — Drizzle Migration trên DB LOCAL"
echo "=================================================================="

DB_HOST="$(ask localhost '🐘 Local DB host')"
DB_PORT="$(ask 5435 '🔌 Local DB port (mặc định 5435 hoặc 5432)')"
DB_USER="$(ask postgres '👤 Local DB user')"
DB_NAME="$(ask sgv_cms '🗄️  Local DB name')"
DB_PASSWORD="$(asks '🔑 Local DB password (mặc định: sgv_secure_pass_2026)')"
DB_PASSWORD="${DB_PASSWORD:-sgv_secure_pass_2026}"

if [ -n "$DB_PASSWORD" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
else
  export DATABASE_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
fi

echo ""
echo "=================================================================="
echo "🎯 Chọn thao tác migration cần thực hiện trên DB LOCAL:"
echo "   1) 🔄 Run pending migrations (Chạy các file .sql trong drizzle/)"
echo "   2) 🧬 Generate migration mới (So sánh schema TypeScript ↔ DB Local)"
echo "   3) ⚡ Drizzle Push (Đồng bộ trực tiếp thay đổi bảng/cột vào DB)"
echo "   4) 📋 Kiểm tra trạng thái DB & danh sách bảng (Status)"
echo "=================================================================="
read -rp "👉 Chọn [1-4] (mặc định: 3): " ACTION
ACTION="${ACTION:-3}"

case "$ACTION" in
  1)
    echo "▶️  Đang chạy migration pending trên LOCAL ($DB_NAME@$DB_HOST:$DB_PORT)..."
    node scripts/drizzle-migrator.js migrate
    ;;

  2)
    read -rp "📝 Tên migration mới (ví dụ: add_products_field): " M_NAME
    if [ -z "$M_NAME" ]; then
      echo "❌ Thiếu tên migration!"; exit 1;
    fi
    echo "🧬 Đang generate migration '$M_NAME' từ diff schema ↔ DB LOCAL..."
    npx drizzle-kit generate --name "$M_NAME"
    echo ""
    NEW_FILE="$(ls -t drizzle/*"$M_NAME"*.sql 2>/dev/null | head -1 || true)"
    if [ -n "$NEW_FILE" ] && [ -f "$NEW_FILE" ]; then
      echo "✅ ĐÃ TẠO FILE MIGRATION: $NEW_FILE"
      echo "--- Nội dung file SQL vừa tạo ---"
      cat "$NEW_FILE"
      echo "---------------------------------"
      read -rp "⚠️  Áp migration này lên DB LOCAL ngay? (gõ đúng 'yes' để chạy): " CONFIRM
      if [ "$CONFIRM" = "yes" ]; then
        echo "▶️  Đang áp migration vừa tạo..."
        node scripts/drizzle-migrator.js migrate
        echo "✅ Đã áp migration mới lên LOCAL thành công!"
      else
        echo "⏸️  Chưa áp lên DB. File: $NEW_FILE."
      fi
    else
      echo "ℹ️  Không có thay đổi mới nào."
    fi
    ;;

  3)
    echo "⚡ Drizzle Push: So sánh trực tiếp bảng & cột từ TypeScript với DB LOCAL..."
    npx drizzle-kit push
    echo "✅ Drizzle push hoàn tất trên LOCAL!"
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
echo "✅ Hoàn tất thao tác trên DB Local ($DB_NAME@$DB_HOST:$DB_PORT)!"
echo "=================================================================="
