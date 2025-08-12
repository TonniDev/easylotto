# Mathematical Algorithms

## Core Mathematical Functions

### Number Classification Functions

#### Prime Number Detection
```typescript
function isPrime(num: number): boolean
```
- **Algorithm**: Trial division with optimizations
- **Optimizations**: Handles 2,3 special cases, checks only odd divisors
- **Range**: Efficient for numbers 1-25 (Lotofácil range)
- **Usage**: Constraint-based number generation

#### Fibonacci Sequence Validation
```typescript
function isFibonacci(num: number): boolean
```
- **Algorithm**: Iterative sequence generation until target
- **Efficiency**: O(log n) time complexity
- **Range**: Covers all Fibonacci numbers in 1-25 range
- **Usage**: Mathematical constraint application

#### Even/Odd Classification
```typescript
function isEven(num: number): boolean
function isOdd(num: number): boolean
```
- **Algorithm**: Modulo 2 operation
- **Usage**: Primary constraint for lottery number distribution

#### Multiple of 3 Detection
```typescript
function isMultipleOf3(num: number): boolean
```
- **Algorithm**: Modulo 3 operation
- **Usage**: Additional mathematical constraint

## Number Generation Algorithms

### Constraint-Based Generation
**Function**: `generateRandomSets(options: GenerateRandomSetsOptions)`

**Algorithm Overview**:
1. **Validation Phase**: Verify constraints are mathematically possible
2. **Pool Creation**: Generate pools for each number type (primes, fibonacci, etc.)
3. **Iterative Generation**: Build each set by satisfying constraints sequentially
4. **Duplicate Prevention**: Ensure no duplicate sets across generation
5. **Validation**: Verify each set meets all specified constraints

**Key Features**:
- **Safety Limits**: Maximum 100 sets per generation
- **Retry Logic**: Up to 1000 attempts per set to find valid combinations
- **Constraint Satisfaction**: Guarantees all mathematical constraints are met
- **Performance Optimization**: Early termination for impossible constraints

### Constraint Satisfaction Process
1. **Prime Numbers**: Add required prime numbers first
2. **Fibonacci Numbers**: Add required Fibonacci numbers (excluding primes if needed)
3. **Multiples of 3**: Add required multiples of 3 (excluding previous types)
4. **Even/Odd Balance**: Fill remaining slots to achieve even/odd distribution
5. **Random Fill**: Complete set with remaining valid numbers

### Validation Algorithm
**Function**: `validateNumbersAgainstConstraints(numbers: number[], constraints: PossibleConstraints)`

**Process**:
1. Count each number type in the generated set
2. Compare counts against specified constraints
3. Return boolean indicating constraint satisfaction

## Combination Analysis

### All Possible Combinations Generator
**Function**: `getAllPossibleConstraintCombinations()`

**Algorithm**: Backtracking with iterative implementation
- **Input**: 15 numbers from range 1-25
- **Output**: All valid mathematical constraint combinations
- **Optimization**: Pagination support for large result sets
- **Performance**: Stack-based iteration to avoid recursion limits

**Mathematical Constraints Analyzed**:
- Even number count (0-15)
- Odd number count (0-15)
- Prime number count (0-9, limited by available primes in range)
- Fibonacci number count (0-6, limited by available Fibonacci numbers)
- Multiple of 3 count (0-8, limited by available multiples)

### Statistical Pattern Generation
**Function**: `generateKeyByAttributesCount(numbers: string[])`

**Purpose**: Create unique identifiers for mathematical patterns
**Format**: `"even:X,odd:Y,prime:Z,fibonacci:A,multipleOf3:B"`
**Usage**: Track pattern frequency in historical data

## Performance Optimizations

### Algorithmic Efficiency
- **Prime Detection**: O(√n) with early termination
- **Fibonacci Check**: O(log n) iterative approach
- **Set Operations**: Use of Set data structure for O(1) lookups
- **Array Operations**: Efficient filtering and mapping

### Memory Management
- **Pool Copying**: Create copies of number pools to avoid mutation
- **Garbage Collection**: Proper cleanup of temporary arrays
- **Safety Counters**: Prevent infinite loops with maximum attempt limits

### Constraint Validation
- **Early Termination**: Stop generation if constraints are impossible
- **Range Validation**: Verify sufficient numbers exist for each constraint type
- **Mathematical Validation**: Ensure even + odd = total numbers

## Mathematical Constants

### Number Ranges (Lotofácil Specific)
- **Total Range**: 1-25 (25 numbers)
- **Selection Size**: 15 numbers per game
- **Prime Numbers in Range**: [2, 3, 5, 7, 11, 13, 17, 19, 23] (9 total)
- **Fibonacci Numbers in Range**: [1, 2, 3, 5, 8, 13, 21] (7 total)
- **Multiples of 3 in Range**: [3, 6, 9, 12, 15, 18, 21, 24] (8 total)

### Constraint Limits
- **Maximum Even**: 15 (if all numbers are even)
- **Maximum Odd**: 15 (if all numbers are odd)
- **Maximum Prime**: 9 (limited by available primes)
- **Maximum Fibonacci**: 7 (limited by available Fibonacci numbers)
- **Maximum Multiple of 3**: 8 (limited by available multiples)

## Error Handling

### Constraint Validation Errors
- Invalid constraint combinations (even + odd ≠ 15)
- Insufficient numbers of specific types
- Impossible mathematical requirements

### Generation Failures
- Maximum retry attempts exceeded
- Duplicate set generation
- Constraint satisfaction failures
