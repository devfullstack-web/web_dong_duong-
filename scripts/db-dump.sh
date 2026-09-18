#!/usr/bin/env bash
#
# Dump DB của container LOCAL (sgv_postgres) → backups/local-<ts>.dump
#
set -euo pipefail
cd "$(dirname "$0")/.."

ask()  { read -rp "$2 [$1]: " R; printf '%s' "${R:-$1}"; }
asks() { read -rsp "$1: " R; echo >&2; printf '%s' "$R"; }

LOCAL_CONTAINER="$(ask sgv_postgres '🐘 Local PG container')"
LOCAL_USER="$(ask postgres '👤 Local DB user')"
LOCAL_DB="$(ask sgv_cms '🗄️  Local DB name')"
LOCAL_PASS="$(asks '🔑 Local DB password (mặc định: sgv_secure_pass_2026)')"
LOCAL_PASS="${LOCAL_PASS:-sgv_secure_pass_2026}"

TS="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
DUMP="backups/local-${LOCAL_DB}-${TS}.dump"

echo "📤 Đang dump database '$LOCAL_DB' từ container local '$LOCAL_CONTAINER'..."
docker exec -e PGPASSWORD="$LOCAL_PASS" "$LOCAL_CONTAINER" \
  pg_dump -U "$LOCAL_USER" -d "$LOCAL_DB" -Fc --no-owner --no-privileges \
  > "$DUMP"

if [ -s "$DUMP" ]; then
  echo "✅ Đã lưu backup local: $DUMP ($$(du -h "$DUMP" | cut -f1))"
else
  echo "❌ Dump thất bại hoặc file rỗng!"
  rm -f "$DUMP"
  exit 1
fi
