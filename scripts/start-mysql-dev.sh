#!/bin/bash

# Quick start script for MySQL development environment
# This script sets up everything needed for local MySQL development

set -e

echo "🐬 Starting MySQL Development Environment"
echo "========================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env exists and create from template if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file from MySQL Docker template..."
    cp .env.docker .env
    echo "✅ Created .env file. You may want to customize it for your needs."
else
    echo "📋 Using existing .env file."
fi

# Stop any existing services to avoid conflicts
echo "🛑 Stopping any existing database services..."
make stop-mysql >/dev/null 2>&1 || true
make stop-postgres >/dev/null 2>&1 || true

# Start MySQL services
echo "🚀 Starting MySQL services..."
make start-mysql-dev

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 15

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Run database migrations
echo "🗄️  Running database migrations..."
yarn migration:run:mysql

echo ""
echo "🎉 MySQL Development Environment Ready!"
echo "======================================="
echo ""
echo "🔗 Access Points:"
echo "  • Application:  http://localhost:3000"
echo "  • phpMyAdmin:   http://localhost:8080"
echo "    - Server:     mysql"
echo "    - Username:   root"
echo "    - Password:   your_secure_password_here"
echo "  • MySQL:        localhost:3306"
echo "    - Database:   fireblocks_push_notifications"
echo "    - User:       fireblocks_user"
echo "    - Password:   fireblocks_password"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the development server: yarn dev"
echo "  2. Open phpMyAdmin at http://localhost:8080"
echo "  3. Connect to MySQL server in phpMyAdmin:"
echo "     - Server: mysql"
echo "     - Username: root or fireblocks_user"
echo "     - Password: your_secure_password_here or fireblocks_password"
echo ""
echo "🛠️  Useful Commands:"
echo "  • View logs:        make logs-mysql"
echo "  • Stop services:    make stop-mysql"
echo "  • Clean restart:    make clean-mysql && ./scripts/start-mysql-dev.sh"
echo "  • Run migrations:   yarn migration:run:mysql"
echo ""
echo "💡 Tip: Your data persists between restarts in Docker volumes."