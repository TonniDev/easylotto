# Technical Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: HeroUI (React component library)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (App Router)
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **HTTP Client**: Axios
- **Logging**: Winston
- **Error Tracking**: Sentry
- **Cron Jobs**: node-cron

### Development & Testing
- **Testing Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Linting**: ESLint
- **Package Manager**: pnpm
- **Development Server**: Next.js dev server (port 3030)

### Infrastructure
- **Containerization**: Docker Compose
- **Database Admin**: Adminer (port 8080)
- **Environment**: Local development with .env.local

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── generator/         # Number generation page
│   ├── generator-sets/    # Bulk generation page
│   ├── my-games/          # Saved games management
│   ├── possible-combinations/ # Mathematical combinations
│   ├── statistics/        # Historical data viewer
│   └── winners-per-state/ # Geographic analysis
├── lib/                   # Core business logic
│   ├── domains/          # Domain-specific repositories
│   ├── definitions/      # Type definitions
│   ├── Network/          # HTTP client abstraction
│   ├── utils/            # Utility functions
│   └── prisma.ts         # Database client
└── ui/                   # Shared UI components
```

## Architecture Patterns

### Repository Pattern
- `LotteryRepository`: Handles external API communication
- `UserGamesRepository`: Manages saved games
- `StatisticsRepository`: Handles statistical data

### Service Layer
- `AxiosService`: HTTP client abstraction
- Mathematical utilities for number generation
- Database utilities for data persistence

### Domain-Driven Design
- Clear separation between lottery, user games, and statistics domains
- Type-safe interfaces for all domain operations
- Centralized validation using Zod schemas

## Database Design

### Core Tables
- **loterias**: Historical lottery results
- **saved_games**: User-generated number sets
- **statistics**: Mathematical pattern statistics
- **prizes**: Prize distribution data
- **winners**: Geographic winner data

### Key Relationships
- One-to-many: loterias → prizes
- One-to-many: loterias → winners
- Independent: saved_games (user data)
- Independent: statistics (aggregated data)

## External Integrations

### Brazilian Lottery API
- **Base URL**: `https://servicebus2.caixa.gov.br/portaldeloterias/api`
- **Endpoints**: `/lotofacil/{number}` for specific games
- **Rate Limiting**: Configurable throttling in cron jobs
- **Error Handling**: Retry logic for transient failures
