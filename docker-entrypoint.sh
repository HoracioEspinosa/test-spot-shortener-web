#!/usr/bin/env sh
set -e

# Ensure VITE_API_URL is set; default to /api passthrough if not
: "${VITE_API_URL:=http://localhost:3000}"

echo "Using VITE_API_URL=${VITE_API_URL}"

envsubst '${VITE_API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;'
