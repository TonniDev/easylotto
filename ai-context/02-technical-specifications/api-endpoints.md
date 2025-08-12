# API Endpoints

## Lottery Data Endpoints

### GET `/api/v1/lottery/lotofacil`
**Purpose**: Retrieve all historical lottery numbers

**Response**: Array of number arrays (string[][])
```json
[
  ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15"],
  ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"]
]
```

**Usage**: Used by statistics page and number generation for historical analysis

### GET `/api/v1/games`
**Purpose**: Paginated access to lottery games with metadata

**Query Parameters**:
- `cursor`: Pagination cursor (optional)
- `take`: Number of items to fetch (default: 100)

**Response**:
```json
{
  "data": [["01", "02", ...], ["02", "03", ...]],
  "from": 1,
  "to": 100,
  "cursor": "uuid-string",
  "take": 100
}
```

## Number Generation Endpoints

### POST `/api/v1/games/generate`
**Purpose**: Generate lottery numbers based on constraints

**Request Body** (optional):
```json
{
  "amountOfSets": 5,
  "itemsInSet": 15,
  "constraints": {
    "even": 7,
    "odd": 8,
    "prime": 4,
    "fibonacci": 2,
    "multipleOf3": 3
  },
  "startEnd": [1, 25]
}
```

**Response**: Array of number arrays
```json
[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]
```

**Validation**: Uses Zod schema for request validation

## Game Management Endpoints

### POST `/api/v1/games/save`
**Purpose**: Save user-generated number sets

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "numbers": [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
  "group": "Group 1" // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully saved 1 game(s).",
  "savedGames": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "numbers": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
      "group": "Group 1"
    }
  ]
}
```

### GET `/api/v1/games/saved`
**Purpose**: Retrieve saved games with filtering

**Query Parameters**:
- `email`: Filter by email (optional)
- `name`: Filter by name (optional)
- `group`: Filter by group (optional)

**Response**: Array of saved games
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "group": "Group 1",
    "listaDezenas": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
    "created": "2024-01-01T00:00:00.000Z"
  }
]
```

## Statistics Endpoints

### GET `/api/v1/games/statistics`
**Purpose**: Retrieve mathematical pattern statistics

**Response**:
```json
{
  "lastLotteryNumber": 3500,
  "results": [
    {
      "statKey": "even:7,odd:8,prime:4,fibonacci:2,multipleOf3:3",
      "value": 15,
      "lastoccurrence": "Game 3495"
    }
  ]
}
```

**Usage**: Powers preset selection in number generation forms

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details" // optional
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **500**: Internal Server Error

## Rate Limiting & Performance

- No explicit rate limiting implemented
- Generation limited to max 100 sets per request
- Database queries optimized with proper indexing
- Pagination used for large datasets

## Authentication

Currently, no authentication is implemented. All endpoints are publicly accessible.
