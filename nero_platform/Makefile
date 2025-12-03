.PHONY: help up down restart logs clean deps-update clean-deps health

help:
	@echo "Neiro Platform - Docker Compose Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make logs            - Show logs from all services"
	@echo "  make logs-<service>  - Show logs from specific service (e.g., make logs-auth)"
	@echo "  make health          - Check health status of all services"
	@echo "  make deps-update     - Update dependencies (run after package.json changes)"
	@echo "  make clean-deps      - Clean all dependency volumes and rebuild"
	@echo "  make clean           - Remove all containers and volumes"
	@echo ""
	@echo "Init commands:"
	@echo "  make init-only       - Run only the init container"
	@echo "  make init-rebuild    - Rebuild and run init container"
	@echo ""

up:
	@echo "Starting all services..."
	docker compose up -d

down:
	@echo "Stopping all services..."
	docker compose down

restart:
	@echo "Restarting all services..."
	docker compose restart

logs:
	docker compose logs -f

logs-%:
	docker compose logs -f $*

health:
	@echo "Checking service health..."
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Dependencies management
deps-update:
	@echo "Updating dependencies..."
	@echo "This will reinstall all packages with Linux binaries"
	docker compose up init --force-recreate
	@echo "Restarting all services..."
	docker compose restart

init-only:
	@echo "Running init container only..."
	docker compose up init

init-rebuild:
	@echo "Rebuilding and running init container..."
	docker compose build init
	docker compose up init --force-recreate

clean-deps:
	@echo "⚠️  WARNING: This will delete all installed dependencies!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "Stopping containers..."; \
		docker compose down; \
		echo "Removing dependency volumes..."; \
		docker volume rm nero_platform_shared_node_modules nero_platform_shared_pnpm_store nero_platform_puppeteer_cache 2>/dev/null || true; \
		echo "Done! Run 'make up' to reinstall dependencies"; \
	fi

clean:
	@echo "⚠️  WARNING: This will delete all containers, volumes, and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "Removing all containers and volumes..."; \
		docker compose down -v; \
		echo "Done!"; \
	fi

# Service-specific commands
build:
	docker compose build

ps:
	docker compose ps

stop-%:
	docker compose stop $*

start-%:
	docker compose start $*

restart-%:
	docker compose restart $*
