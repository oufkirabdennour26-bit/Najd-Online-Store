#!/bin/sh
set -e

# Ensure the database schema is in sync with the Prisma models
echo "Checking and applying database schema migrations..."
npx prisma db push --skip-generate --accept-data-loss

# Execute the primary container command (e.g. npm run start)
echo "Launching application server..."
exec "$@"
