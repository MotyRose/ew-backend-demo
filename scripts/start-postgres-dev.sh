#!/bin/bash

# Quick start script for PostgreSQL development environment
# This script sets up everything needed for local PostgreSQL development

set -e

echo "🐘 Starting PostgreSQL Development Environment"
echo "=============================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env exists and create from template if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file from PostgreSQL Docker template..."
    cp .env.docker.postgres .env
    echo "✅ Created .env file. You may want to customize it for your needs."
else
    echo "📋 Using existing .env file."
fi

# Stop any existing services to avoid conflicts
echo "🛑 Stopping any existing database services..."
make stop-postgres >/dev/null 2>&1 || true
make stop-mysql >/dev/null 2>&1 || true

# Start PostgreSQL services
echo "🚀 Starting PostgreSQL services..."
make start-postgres-dev

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Run database migrations
echo "🗄️  Running database migrations..."
yarn migration:run:postgres

echo ""
echo "🎉 PostgreSQL Development Environment Ready!"
echo "============================================="
echo ""
echo "🔗 Access Points:"
echo "  • Application:  http://localhost:3000"
echo "  • pgAdmin:      http://localhost:8080"
echo "    - Email:      admin@fireblocks.com"
echo "    - Password:   admin_password"
echo "  • PostgreSQL:   localhost:5432"
echo "    - Database:   fireblocks_push_notifications"
echo "    - User:       fireblocks_user"
echo "    - Password:   fireblocks_password"
echo "  • Redis:        localhost:6379"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the development server: yarn dev"
echo "  2. Open pgAdmin at http://localhost:8080"
echo "  3. Connect to PostgreSQL server in pgAdmin:"
echo "     - Host: postgres (or localhost from outside Docker)"
echo "     - Port: 5432"
echo "     - Database: fireblocks_push_notifications"
echo "     - Username: fireblocks_user"
echo "     - Password: fireblocks_password"
echo ""
echo "🛠️  Useful Commands:"
echo "  • View logs:        make logs-postgres"
echo "  • Stop services:    make stop-postgres"
echo "  • Clean restart:    make clean-postgres && ./scripts/start-postgres-dev.sh"
echo "  • Run migrations:   yarn migration:run:postgres"
echo ""
echo "💡 Tip: Your data persists between restarts in Docker volumes."