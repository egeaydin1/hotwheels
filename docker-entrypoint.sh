#!/bin/sh
set -e

echo "⏳  Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

if [ "${SEED_DATA:-false}" = "true" ]; then
  echo "🌱  Importing Hot Wheels catalog data (this may take a minute)..."
  node scripts/import-hotwheels-data.js
  echo "✅  Data import complete."
fi

echo "🚀  Starting HW Vault..."
exec node server.js
