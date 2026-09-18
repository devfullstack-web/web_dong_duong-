#!/usr/bin/env bash
#
# Reset DB local và restore từ file dump (.dump hoặc .sql).
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " REPLY; printf '%s' "${REPLY:-$1}"; }
asks() { read -rsp "$1: " REPLY; echo >&2; printf '%s' "$REPLY"; }

FILE="${1:-}"
if [ -z "$FILE" ]; then
  # Nếu không truyền file, tự động lấy file mới nhất trong backups/
  LATEST="$(ls -t backups/*.dump backups/*.sql 2>/dev/null | head -1 || true)"
  FILE="$(ask "${LATEST}" '📁 Đường dẫn file dump')"
fi

[ -f "$FILE" ] || { echo "❌ Không tìm thấy file: $FILE"; exit 1; }

echo "===================================================="
echo "  📥 Restore DB Local từ file dump"
echo "  📄 File: $FILE ($$(du -h "$FILE" | cut -f1))"
echo "===================================================="

LOCAL_CONTAINER="$(ask sgv_postgres '🐘 Local PG container')"
LOCAL_DB="$(ask sgv_cms '🗄️  Local DB name')"
LOCAL_USER="$(ask postgres '👤 Local DB user')"
LOCAL_PASS="$(asks '🔑 Local DB password (mặc định: sgv_secure_pass_2026)')"
LOCAL_PASS="${LOCAL_PASS:-sgv_secure_pass_2026}"

docker inspect "$LOCAL_CONTAINER" >/dev/null 2>&1 || { echo "❌ Container '$LOCAL_CONTAINER' không chạy! Hãy chạy 'docker compose up -d postgres' trước."; exit 1; }

echo "⚠️  CẢNH BÁO: Thao tác này sẽ DROP & TẠO LẠI DB '$LOCAL_DB' trên local container '$LOCAL_CONTAINER'!"
read -rp "👉 Gõ 'yes' để xác nhận thực hiện: " CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Đã hủy."; exit 1; }

echo "🛑 Đang ngắt kết nối và tạo lại DB..."
docker exec -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" \
  psql -U "$LOCAL_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS \"$LOCAL_DB\" WITH (FORCE);"
docker exec -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" \
  psql -U "$LOCAL_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "CREATE DATABASE \"$LOCAL_DB\" OWNER \"$LOCAL_USER\";"

echo "📥 Đang nạp dữ liệu..."
if [[ "$FILE" == *.sql ]]; then
  cat "$FILE" | docker exec -i -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" psql -U "$LOCAL_USER" -d "$LOCAL_DB"
else
  docker cp "$FILE" "$LOCAL_CONTAINER:/tmp/_restore.dump"
  docker exec -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" \
    pg_restore -U "$LOCAL_USER" -d "$LOCAL_DB" --no-owner --no-privileges \
    /tmp/_restore.dump || echo "⚠️  pg_restore có warning nhỏ (thường vô hại)."
  docker exec "$LOCAL_CONTAINER" rm -f /tmp/_restore.dump
fi

echo "🔎 Kiểm tra nhanh:"
docker exec -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" psql -At -U "$LOCAL_USER" -d "$LOCAL_DB" \
  -c "SELECT 'Số bảng public: ' || count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || true

echo "✅ Restore thành công vào container $LOCAL_CONTAINER, database $LOCAL_DB!"
