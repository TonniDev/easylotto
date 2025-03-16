.PHONY: help

# Main docker compose script
up:
		docker-compose --env-file .env.local up -d
		sleep 5
		docker-compose ps
		sleep 3
		pnpm dev

up-db:
		docker-compose --env-file .env.local up -d
		sleep 5
		docker-compose ps

up-server:
		pnpm dev

down:
		docker-compose down

migrations:
		dotenv -f .env.local pnpm migration:create:dev

migrate:
		dotenv -f .env.local pnpm migrate:dev

rollback:
		dotenv -f .env.local pnpm migrate:reset:dev

status:
		docker-compose ps

test:
		pnpm vitest

test-run:
		pnpm vitest --run

test-watch:
		pnpm vittest --watch

test-coverage:
		pnpm vittest --coverage
