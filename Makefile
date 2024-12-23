.PHONY: help

# Main docker compose script
up:
		docker-compose up -d
		sleep 5
		docker-compose ps
		sleep 3
		pnpm dev

down:
		docker-compose down

migrations:
		dotenv -f .env.local pnpm migration:create:dev

migrate:
		dotenv -f .env.local pnpm migrate:dev

status:
		docker-compose ps
