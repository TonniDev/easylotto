.PHONY: help

# Load .env.local via the npm dotenv-cli (the global `dotenv` may be a different tool, e.g. python-dotenv)
DOTENV = npx -y dotenv-cli -e .env.local --
TSX = npx -y tsx

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
		$(DOTENV) pnpm migration:create:dev

migrate:
		$(DOTENV) pnpm migrate:dev

update:
		$(DOTENV) $(TSX) src/lib/utils/cron/update.ts

rollback:
		$(DOTENV) pnpm migrate:reset:dev

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
