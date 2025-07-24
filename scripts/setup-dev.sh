#!/bin/bash

# Interactive setup script for Fireblocks Push Notification Service
# Allows users to choose between PostgreSQL or MySQL for local development

set -e

echo "🔧 Fireblocks Push Notification Service - Development Setup"
echo "==========================================================="
echo ""
echo "This script will help you set up a local development environment."
echo "You can choose between PostgreSQL (recommended) or MySQL."
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running."
    echo "   Please start Docker and run this script again."
    exit 1
fi

# Function to setup PostgreSQL
setup_postgres() {
    echo ""
    echo "🐘 Setting up PostgreSQL development environment..."
    ./scripts/start-postgres-dev.sh
}

# Function to setup MySQL
setup_mysql() {
    echo ""
    echo "🐬 Setting up MySQL development environment..."
    ./scripts/start-mysql-dev.sh
}

# Interactive menu
echo "📋 Choose your database:"
echo "  1) PostgreSQL (Recommended)"
echo "     • Modern database with advanced features"
echo "     • Includes pgAdmin web interface" 
echo "     • Redis for caching"
echo "     • Better for complex queries and JSON data"
echo ""
echo "  2) MySQL"
echo "     • Traditional, widely-used database"
echo "     • Includes phpMyAdmin web interface"
echo "     • Lighter resource usage"
echo "     • Better for simple queries and compatibility"
echo ""

while true; do
    read -p "Enter your choice (1 or 2): " choice
    case $choice in
        1)
            setup_postgres
            break
            ;;
        2)
            setup_mysql
            break
            ;;
        *)
            echo "❌ Invalid choice. Please enter 1 or 2."
            ;;
    esac
done

echo ""
echo "🎯 Development environment setup complete!"
echo ""
echo "📚 Next Steps:"
echo "  1. Review your .env file and customize as needed"
echo "  2. Generate VAPID keys: npx web-push generate-vapid-keys"
echo "  3. Get Firebase service account JSON from Firebase Console"
echo "  4. Update authentication settings (JWKS_URI, ISSUER, AUDIENCE)"
echo "  5. Start development: yarn dev"
echo ""
echo "📖 Documentation:"
echo "  • Full setup guide: CLAUDE.md"
echo "  • Database comparison: DATABASE-COMPARISON.md"
echo "  • Available commands: make help"
echo ""
echo "🆘 Need help? Check the documentation or run 'make help'"