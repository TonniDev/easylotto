# Features and Functionality

## Core Features

### 1. Number Generation (`/generator`)
**Purpose**: Generate lottery numbers based on mathematical constraints

**Key Capabilities**:
- Generate 1-100 sets of 15 numbers (range 1-25)
- Apply mathematical constraints:
  - Even/odd number distribution
  - Prime number inclusion
  - Fibonacci number inclusion
  - Multiples of 3 inclusion
- Preset selection based on historical statistics
- Duplicate prevention across generated sets
- Visual number display with mathematical analysis

**User Flow**:
1. Select preset or manually set constraints
2. Specify number of sets to generate
3. Click generate to create number sets
4. Review generated numbers with mathematical breakdown
5. Select and save preferred sets

### 2. Bulk Set Generation (`/generator-sets`)
**Purpose**: Generate multiple groups of number sets for organized play

**Key Capabilities**:
- Create multiple named groups
- Generate non-repeating games across all groups
- Customizable group naming patterns
- Bulk save functionality with group organization
- Advanced constraint application across groups

**User Flow**:
1. Define number of groups and games per group
2. Set group naming pattern (e.g., "Group {i}")
3. Apply mathematical constraints
4. Generate all groups simultaneously
5. Save entire collection with group metadata

### 3. Saved Games Management (`/my-games`)
**Purpose**: Organize and track user-generated number sets

**Key Capabilities**:
- Search by email, name, or group
- Visual display of saved number sets
- Mathematical analysis of each set
- Group-based organization
- Historical tracking of saved games

**User Flow**:
1. Enter search criteria (email/name/group)
2. Browse saved games with visual cards
3. View mathematical breakdown of each set
4. Organize games by groups for better management

### 4. Historical Statistics (`/statistics`)
**Purpose**: Browse and analyze historical lottery results

**Key Capabilities**:
- Paginated view of all historical games
- Reverse chronological order (newest first)
- Mathematical analysis of each historical game
- Pattern identification across time
- Load-more functionality for performance

**User Flow**:
1. Browse historical games in card format
2. View mathematical breakdown of each game
3. Load more games as needed
4. Analyze patterns and trends

### 5. Mathematical Combinations (`/possible-combinations`)
**Purpose**: Explore all possible mathematical constraint combinations

**Key Capabilities**:
- Generate all valid constraint combinations for 15 numbers
- Paginated display (20 combinations per page)
- Mathematical validation of each combination
- Performance-optimized calculation
- Educational tool for understanding constraints

**User Flow**:
1. Browse paginated combinations
2. Understand mathematical possibilities
3. Use insights for informed number generation

### 6. Geographic Analysis (`/winners-per-state`)
**Purpose**: Analyze lottery winners by Brazilian states

**Key Capabilities**:
- State-wise winner distribution
- Percentage calculations
- Formatted number display
- Comprehensive geographic insights
- Historical winner tracking

**User Flow**:
1. View tabular data of winners by state
2. Analyze geographic patterns
3. Understand regional lottery participation

## Technical Features

### Mathematical Algorithms
- **Prime Detection**: Efficient prime number identification
- **Fibonacci Validation**: Sequence-based number validation
- **Constraint Satisfaction**: Multi-constraint number generation
- **Duplicate Prevention**: Set uniqueness across generations
- **Statistical Analysis**: Pattern recognition in historical data

### Data Management
- **Real-time Sync**: Automated lottery data updates
- **Cron Jobs**: Scheduled data fetching from official APIs
- **Error Handling**: Robust retry mechanisms
- **Data Validation**: Type-safe operations with Zod
- **Performance Optimization**: Efficient database queries

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Dark Theme**: Modern dark UI with HeroUI
- **Loading States**: Smooth user feedback
- **Form Validation**: Real-time input validation
- **Error Messages**: Clear user guidance
