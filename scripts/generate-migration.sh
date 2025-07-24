#!/bin/bash

# Script to generate database-specific migrations
# Usage: ./scripts/generate-migration.sh MigrationName

if [ -z "$1" ]; then
    echo "Usage: $0 <MigrationName>"
    exit 1
fi

MIGRATION_NAME=$1

echo "Generating migration for MySQL..."
DB_TYPE=mysql yarn typeorm migration:generate "src/migrations/${MIGRATION_NAME}MySQL" -d src/data-source.ts

echo "Generating migration for PostgreSQL..."
DB_TYPE=postgres yarn typeorm migration:generate "src/migrations/${MIGRATION_NAME}Postgres" -d src/data-source.ts

echo "Generated migrations:"
echo "- src/migrations/${MIGRATION_NAME}MySQL-*.ts"
echo "- src/migrations/${MIGRATION_NAME}Postgres-*.ts"
echo ""
echo "You can now merge these into a unified migration like CreateTables.ts"