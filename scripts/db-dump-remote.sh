#!/usr/bin/env bash
#
# Backup DB REMOTE (VPS) về máy local: SSH → pg_dump container sgv_postgres → tải về backups/
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " R; printf '%s' "${R:-$1}"; }
asks() { read -rsp "$1: " R; echo >&2; printf '%s' "$R"; }

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

echo "===================================================="
echo "  📦 Dump DB Remote VPS → Local"
echo "  🔗 Server   : $VPS_USER@$VPS_HOST"
echo "  🐘 Container: $REMOTE_CONTAINER"
echo "  🗄️  Database : $REMOTE_DB_NAME (user: $REMOTE_DB_USER)"
echo "  💾 Target   : $DUMP"
echo "===================================================="

if [ -n "$REMOTE_DB_PASSWORD" ]; then
  PASS_ENV="PGPASSWORD='$REMOTE_DB_PASSWORD'"
else
  PASS_ENV=""
fi

echo "📤 Đang dump database trên remote và stream tải về..."
ssh "$VPS_USER@$VPS_HOST" \
  "docker exec -e $PASS_ENV '$REMOTE_CONTAINER' \
     pg_dump -U '$REMOTE_DB_USER' -d '$REMOTE_DB_NAME' -Fc --no-owner --no-privileges" \
  > "$DUMP"

if [ ! -s "$DUMP" ]; then
  echo "❌ Dump rỗng hoặc thất bại. Vui lòng kiểm tra lại SSH và container name!"
  rm -f "$DUMP"
  exit 1
fi

echo "✅ Backup thành công: $DUMP ($$(du -h "$DUMP" | cut -f1))"
