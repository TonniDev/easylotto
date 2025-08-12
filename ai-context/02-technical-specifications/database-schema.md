# Database Schema

## Overview
The application uses PostgreSQL with Prisma ORM. The schema is organized into multiple files for better maintainability.

## Core Tables

### `loterias` (Historical Lottery Data)
**Purpose**: Stores complete historical lottery game data from official Brazilian lottery API

**Key Fields**:
- `id`: UUID primary key
- `numero`: Game number (unique, integer)
- `listaDezenas`: Array of winning numbers (string[])
- `dataApuracao`: Draw date (string, format: DD/MM/YYYY)
- `acumulado`: Whether the prize was accumulated (boolean)
- `valorArrecadado`: Total collected amount (decimal)
- `valorEstimadoProximoConcurso`: Next game estimated prize (decimal)

**Relationships**:
- One-to-many with `prizes` table
- One-to-many with `winners` table

**Indexes**: 
- Primary: `numero`
- Secondary: `[id, numero]`

### `saved_games` (User Generated Games)
**Purpose**: Stores user-generated number sets with metadata

**Key Fields**:
- `id`: UUID primary key
- `email`: User email (string)
- `name`: User name (string)
- `listaDezenas`: Generated numbers (string[])
- `group`: Optional group name (string)
- `created`: Timestamp (auto-generated)

**Usage**: Powers the "My Games" functionality

### `statistics` (Mathematical Patterns)
**Purpose**: Aggregated statistics about mathematical patterns in historical games

**Key Fields**:
- `id`: UUID primary key
- `statKey`: Pattern identifier (string, unique)
- `value`: Occurrence count (integer)
- `games`: Array of game numbers where pattern occurred (string[])

**Example statKey**: `"even:7,odd:8,prime:4,fibonacci:2,multipleOf3:3"`

### `prizes` (Prize Distribution)
**Purpose**: Prize breakdown for each lottery game

**Key Fields**:
- `id`: UUID primary key
- `concurso`: Game number (foreign key to loterias.numero)
- `descricao_faixa`: Prize tier description
- `faixa`: Prize tier number (integer)
- `numeroDeGanhadores`: Number of winners (integer)
- `valorPremio`: Prize value (decimal)

**Relationship**: Many-to-one with `loterias`

### `winners` (Geographic Winners)
**Purpose**: Geographic distribution of lottery winners

**Key Fields**:
- `id`: UUID primary key
- `concurso`: Game number (foreign key to loterias.numero)
- `municipio`: City name (string)
- `uf`: State abbreviation (string)
- `ganhadores`: Number of winners (integer)
- `posicao`: Position/ranking (integer)

**Relationship**: Many-to-one with `loterias`

## Schema Organization

### File Structure
```
prisma/schema/
├── schema.prisma          # Main configuration
├── loterias.prisma        # Historical lottery data
├── saved_games.prisma     # User-generated games
├── statistics.prisma      # Mathematical patterns
├── prizes.prisma          # Prize distribution
└── winners.prisma         # Geographic winners
```

### Database Configuration
- **Provider**: PostgreSQL
- **Connection**: Environment variable `POSTGRES_PRISMA_URL`
- **Features**: Driver adapters, full-text search, schema folder organization

## Data Relationships

### Primary Data Flow
1. **External API** → `loterias` (via cron jobs)
2. **loterias** → `statistics` (pattern analysis)
3. **loterias** → `prizes` + `winners` (detailed breakdown)
4. **User Input** → `saved_games` (independent user data)

### Key Constraints
- `loterias.numero`: Unique game identifier
- `statistics.statKey`: Unique pattern identifier
- Foreign keys maintain referential integrity
- Array fields store JSON data efficiently

## Performance Considerations

### Indexing Strategy
- Primary keys on all tables (UUID)
- Unique indexes on business keys (`numero`, `statKey`)
- Composite indexes for common query patterns

### Query Optimization
- Pagination for large datasets
- Selective field retrieval
- Efficient array operations for number lists

### Data Volume
- Historical games: ~3,500+ records (growing)
- Statistics: Thousands of unique patterns
- User games: Unlimited growth potential
- Prizes/Winners: Proportional to historical games

## Migration History
- **Initial**: Basic lottery data structure
- **Statistics**: Added pattern analysis table
- **Saved Games**: User game management
- **User Games**: Enhanced user data structure
- **Groups**: Added group organization feature
