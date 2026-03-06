#!/bin/bash

OUTPUT="sgv_cms_$(date +%Y%m%d_%H%M%S).zip"

echo "Đang nén dự án -> $OUTPUT ..."

zip -r "$OUTPUT" . \
  --exclude "node_modules/*" \
  --exclude ".next/*" \
  --exclude ".git/*" \
  --exclude "*.zip"

echo "Hoàn tất: $OUTPUT ($(du -sh "$OUTPUT" | cut -f1))"
