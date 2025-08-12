# Data Synchronization

## Overview
The application maintains real-time synchronization with the official Brazilian lottery API to ensure historical data accuracy and completeness.

## External Data Source

### Brazilian Lottery API
- **Base URL**: `https://servicebus2.caixa.gov.br/portaldeloterias/api`
- **Primary Endpoint**: `/lotofacil/{gameNumber}`
- **Data Format**: JSON with complete game information
- **Update Frequency**: New games typically 3 times per week
- **Data Scope**: Complete historical data from game #1 to current

### API Response Structure
```json
{
  "numero": 3500,
  "dataApuracao": "31/12/2024",
  "listaDezenas": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"],
  "acumulado": false,
  "valorArrecadado": 50000000.00,
  "valorEstimadoProximoConcurso": 1700000.00,
  "listaRateioPremio": [...],
  "listaMunicipioUFGanhadores": [...]
}
```

## Synchronization Scripts

### Initial Population (`populate.ts`)
**Purpose**: First-time database population with all historical data

**Key Features**:
- Fetches all games from #1 to current
- Configurable throttling to respect API limits
- Comprehensive error handling with retries
- Progress logging and monitoring
- Automatic statistics generation

**Usage**:
```bash
make update  # Runs the populate script
```

**Configuration**:
- `--items`: Number of items to process
- `--throttle`: Delay between requests (seconds)
- `--retries`: Number of retry attempts
- `--cron`: Cron expression for scheduling

### Incremental Updates (`update.ts`)
**Purpose**: Daily updates to fetch new lottery results

**Algorithm**:
1. Query latest game number from external API
2. Find last saved game in local database
3. Calculate missing games
4. Fetch and save missing games sequentially
5. Generate statistics for new games

**Scheduling**: Designed to run via cron job
**Error Handling**: Stops on first failure to maintain data integrity

## Cron Job Management

### Configuration Options
- **Throttling**: Configurable delay between API requests
- **Retry Logic**: Automatic retry for transient failures
- **Batch Processing**: Process multiple games in sequence
- **Error Recovery**: Graceful handling of API failures

### Monitoring and Logging
- **Winston Logger**: Structured logging to files
- **Sentry Integration**: Error tracking and alerting
- **Progress Tracking**: Real-time processing status
- **Success Metrics**: Completion statistics

## Error Handling Strategy

### Transient Error Detection
```typescript
function isTransientError(err: AxiosError): boolean {
  // HTTP 5xx errors
  if (err.response?.status >= 500) return true;
  // Rate limiting (429)
  if (err.response?.status === 429) return true;
  // Network errors
  if (err.request && !err.response) return true;
  return false;
}
```

### Retry Mechanism
- **Exponential Backoff**: Increasing delays between retries
- **Maximum Attempts**: Configurable retry limits
- **Failure Logging**: Detailed error information
- **Graceful Degradation**: Continue with next items on failure

## Data Processing Pipeline

### Game Data Processing
1. **Fetch**: Retrieve game data from external API
2. **Transform**: Convert to internal data format
3. **Validate**: Ensure data integrity and completeness
4. **Store**: Save to PostgreSQL database
5. **Analyze**: Generate mathematical statistics
6. **Index**: Update search and query indexes

### Statistics Generation
For each new game:
1. **Pattern Analysis**: Identify mathematical patterns
2. **Key Generation**: Create unique pattern identifiers
3. **Upsert Statistics**: Update occurrence counts
4. **Game Tracking**: Record which games contain each pattern

### Data Integrity Measures
- **Transaction Safety**: Database transactions for consistency
- **Duplicate Prevention**: Check for existing games before insertion
- **Validation**: Verify data format and completeness
- **Rollback Capability**: Ability to reset and re-sync data

## Performance Optimization

### API Rate Limiting
- **Configurable Throttling**: Respect external API limits
- **Batch Processing**: Process multiple items efficiently
- **Connection Pooling**: Reuse HTTP connections
- **Timeout Handling**: Prevent hanging requests

### Database Optimization
- **Bulk Operations**: Efficient batch inserts
- **Index Usage**: Optimized queries for large datasets
- **Connection Management**: Proper database connection handling
- **Memory Management**: Efficient data processing

## Monitoring and Maintenance

### Health Checks
- **API Availability**: Monitor external API status
- **Data Freshness**: Track last successful update
- **Error Rates**: Monitor failure frequencies
- **Performance Metrics**: Track processing times

### Maintenance Tasks
- **Log Rotation**: Manage log file sizes
- **Database Cleanup**: Remove temporary data
- **Index Maintenance**: Optimize database performance
- **Backup Verification**: Ensure data backup integrity

## Configuration Management

### Environment Variables
- `POSTGRES_PRISMA_URL`: Database connection
- `SENTRY_DSN`: Error tracking configuration
- `NODE_ENV`: Environment specification

### Command Line Options
- `--items`: Limit processing scope
- `--throttle`: Control API request rate
- `--retries`: Configure retry behavior
- `--cron`: Set scheduling expression
