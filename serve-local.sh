#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_ROOT="$SCRIPT_DIR/build/site"
MIME_TYPES="$(brew --prefix)/etc/nginx/mime.types"
TMP_CONF=/tmp/nginx-evolveum-local.conf

if [ ! -d "$SITE_ROOT" ]; then
    echo "Site not built yet. Run: npm run build" >&2
    exit 1
fi

sed -e "s|__SITE_ROOT__|$SITE_ROOT|g" \
    -e "s|__MIME_TYPES__|$MIME_TYPES|g" \
    "$SCRIPT_DIR/nginx-local.conf" > "$TMP_CONF"

echo "Serving $SITE_ROOT at http://127.0.0.1:8080"
exec nginx -c "$TMP_CONF" -g 'daemon off;'
