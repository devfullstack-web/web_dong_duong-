#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for database to be ready..."
# Use nc (netcat) to wait for the db port to be open
until nc -z ${POSTGRES_HOST} ${POSTGRES_PORT}; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - executing migrations"
# Push schema transitions to the database
npm run db:push

# Check if seeding is already done
SEED_FLAG="/app/data/.seeded"

if [ ! -f "$SEED_FLAG" ]; then
  echo "First run detected - Seeding database..."
  npm run db:seed && touch "$SEED_FLAG" || echo "Seeding failed"
else
  echo "Database already seeded - skipping"
fi

echo "Starting application..."
# Start the production server
exec tsx server.ts
