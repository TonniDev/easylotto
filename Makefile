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
		dotenv -e .env.local pnpm migration:create:dev

migrate:
		dotenv -e .env.local pnpm migrate:dev

update:
		dotenv -e .env.local npx tsx src/lib/utils/cron/update.ts

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
