SHELL := /bin/bash

# Default MySQL setup (backward compatibility)
start:
	docker-compose up -d

stop:
	docker-compose down

restart: stop start

# MySQL-specific commands
start-mysql:
	docker-compose -f docker-compose.mysql.yml up -d

stop-mysql:
	docker-compose -f docker-compose.mysql.yml down

restart-mysql: stop-mysql start-mysql

# PostgreSQL-specific commands
start-postgres:
	docker-compose -f docker-compose.postgres.yml up -d

stop-postgres:
	docker-compose -f docker-compose.postgres.yml down

restart-postgres: stop-postgres start-postgres

# Development helpers
start-mysql-dev: start-mysql
	@echo "MySQL development environment started!"
	@echo "MySQL: localhost:3306 (user: fireblocks_user, password: fireblocks_password)"
	@echo "phpMyAdmin: http://localhost:8080"
	@echo ""
	@echo "To connect your app, use: DB_TYPE=mysql in your .env file"

start-postgres-dev: start-postgres
	@echo "PostgreSQL development environment started!"
	@echo "PostgreSQL: localhost:5432 (user: fireblocks_user, password: fireblocks_password)"  
	@echo "pgAdmin: http://localhost:8080 (email: admin@fireblocks.com, password: admin_password)"
	@echo "Redis: localhost:6379"
	@echo ""
	@echo "To connect your app, use: DB_TYPE=postgres in your .env file"

# Cleanup commands
clean-mysql:
	docker-compose -f docker-compose.mysql.yml down -v
	docker volume rm -f fireblocks-ew-backend-demo_mysql_data

clean-postgres:
	docker-compose -f docker-compose.postgres.yml down -v
	docker volume rm -f fireblocks-ew-backend-demo_postgres_data fireblocks-ew-backend-demo_pgadmin_data fireblocks-ew-backend-demo_redis_data

# Logs
logs-mysql:
	docker-compose -f docker-compose.mysql.yml logs -f

logs-postgres:
	docker-compose -f docker-compose.postgres.yml logs -f

# Status
status-mysql:
	docker-compose -f docker-compose.mysql.yml ps

status-postgres:
	docker-compose -f docker-compose.postgres.yml ps

# Help
help:
	@echo "Fireblocks Push Notification Service - Docker Commands"
	@echo ""
	@echo "MySQL Commands:"
	@echo "  make start-mysql-dev    Start MySQL with phpMyAdmin (recommended for development)"
	@echo "  make start-mysql        Start MySQL services only"
	@echo "  make stop-mysql         Stop MySQL services"
	@echo "  make restart-mysql      Restart MySQL services"
	@echo "  make logs-mysql         View MySQL logs"
	@echo "  make status-mysql       View MySQL service status"
	@echo "  make clean-mysql        Stop and remove MySQL volumes"
	@echo ""
	@echo "PostgreSQL Commands:"
	@echo "  make start-postgres-dev Start PostgreSQL with pgAdmin (recommended for development)"
	@echo "  make start-postgres     Start PostgreSQL services only"
	@echo "  make stop-postgres      Stop PostgreSQL services"
	@echo "  make restart-postgres   Restart PostgreSQL services"
	@echo "  make logs-postgres      View PostgreSQL logs"
	@echo "  make status-postgres    View PostgreSQL service status"
	@echo "  make clean-postgres     Stop and remove PostgreSQL volumes"
	@echo ""
	@echo "Legacy Commands (MySQL):"
	@echo "  make start              Start MySQL (backward compatibility)"
	@echo "  make stop               Stop MySQL (backward compatibility)"
	@echo "  make restart            Restart MySQL (backward compatibility)"

.PHONY: start stop restart start-mysql stop-mysql restart-mysql start-postgres stop-postgres restart-postgres start-mysql-dev start-postgres-dev clean-mysql clean-postgres logs-mysql logs-postgres status-mysql status-postgres help
