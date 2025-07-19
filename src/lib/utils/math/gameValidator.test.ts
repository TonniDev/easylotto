import { getAllPossibleConstraintCombinations } from './gameValidator';

// Test the getAllPossibleConstraintCombinations function
describe('getAllPossibleConstraintCombinations', () => {
  it('should return non-empty results for valid inputs', () => {
    // Use the same parameters as in the page.tsx file
    const {combinations} = getAllPossibleConstraintCombinations(15, 1, 25);
    
    // Check that the result is not empty
    expect(combinations.length).toBeGreaterThan(0);
    
    // Log the first few combinations for inspection
    console.log('First 5 combinations:', combinations.slice(0, 5));
    
    // Check that each combination has the expected properties
    combinations.slice(0, 5).forEach(combination => {
      expect(combination).toHaveProperty('even');
      expect(combination).toHaveProperty('odd');
      expect(combination).toHaveProperty('prime');
      expect(combination).toHaveProperty('fibonacci');
      expect(combination).toHaveProperty('multipleOf3');
    });
  });
});
