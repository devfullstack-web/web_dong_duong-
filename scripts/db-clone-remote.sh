#!/usr/bin/env bash
#
# Clone TOÀN BỘ database từ REMOTE (VPS) về LOCAL.
# Luồng: SSH vào VPS → pg_dump trong container remote → stream dump về local
#        → (tùy chọn) restore vào container Postgres local.
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " REPLY; printf '%s' "${REPLY:-$1}"; }
asks() { read -rsp "$1: " REPLY; echo >&2; printf '%s' "$REPLY"; }

echo "===================================================="
echo "  📦 SGV Web Đông Dương — Clone DB Remote → Local"
echo "===================================================="

VPS_HOST="$(ask 14.241.237.132 '🌐 VPS Host (IP/domain)')"
VPS_USER="$(ask sgv '👤 VPS User')"
REMOTE_CONTAINER="$(ask sgv_postgres '🐘 Remote PG container')"
REMOTE_DB_USER="$(ask postgres '👤 Remote DB user')"
REMOTE_DB_NAME="$(ask sgv_cms '🗄️  Remote DB name')"
REMOTE_DB_PASSWORD="$(asks '🔑 Remote DB password (Enter nếu không cần)')"

TS="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
HOST_SAFE="$(printf '%s' "$VPS_HOST" | tr -c 'A-Za-z0-9._-' '_')"
DUMP="backups/remote-${HOST_SAFE}-${TS}.dump"

if [ -n "$REMOTE_DB_PASSWORD" ]; then
  PASS_ENV="PGPASSWORD='$REMOTE_DB_PASSWORD'"
else
  PASS_ENV=""
fi

echo "📤 Đang dump database trên VPS và tải về: $DUMP ..."
ssh "$VPS_USER@$VPS_HOST" \
  "docker exec -e $PASS_ENV '$REMOTE_CONTAINER' \
     pg_dump -U '$REMOTE_DB_USER' -d '$REMOTE_DB_NAME' -Fc --no-owner --no-privileges" \
  > "$DUMP"

if [ ! -s "$DUMP" ]; then
  echo "❌ Tải dump thất bại hoặc file rỗng!"
  rm -f "$DUMP"
  exit 1
fi

echo "✅ Tải dump thành công ($$(du -h "$DUMP" | cut -f1))!"

if [ "${DUMP_ONLY:-0}" = "1" ]; then
  echo "ℹ️  Chế độ DUMP_ONLY: đã lưu dump tại $DUMP."
  exit 0
fi

echo ""
read -rp "👉 Bạn có muốn nạp file dump này vào DB LOCAL ngay bây giờ? (gõ 'yes' để nạp): " DO_RESTORE
if [ "$DO_RESTORE" = "yes" ]; then
  bash ./scripts/db-restore-local.sh "$DUMP"
else
  echo "ℹ️  Bỏ qua restore. File dump đã được lưu an toàn tại: $DUMP"
fi
