#!/bin/bash
set -e

STANDALONE_DIR=".next/standalone"
STATIC_DIR=".next/static"
PUBLIC_DIR="public"
OUTPUT="sgv_cms_standalone_$(date +%Y%m%d_%H%M%S).tar.gz"

# Kiểm tra thư mục standalone tồn tại
if [ ! -d "$STANDALONE_DIR" ]; then
    echo "❌ Không tìm thấy $STANDALONE_DIR — hãy chạy 'npm run build' trước."
    exit 1
fi

echo "📦 Đang copy static files vào standalone..."

# Copy .next/static vào standalone/.next/static (required for production)
mkdir -p "$STANDALONE_DIR/.next/static"
cp -r "$STATIC_DIR/." "$STANDALONE_DIR/.next/static/"

# Copy public vào standalone/public
mkdir -p "$STANDALONE_DIR/public"
cp -r "$PUBLIC_DIR/." "$STANDALONE_DIR/public/"

echo "🗜️  Đang nén -> $OUTPUT ..."
tar -czf "$OUTPUT" -C "$STANDALONE_DIR" .

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo "✅ Hoàn tất: $OUTPUT ($SIZE)"
echo ""
echo "Deploy: giải nén rồi chạy:  node server.js"
