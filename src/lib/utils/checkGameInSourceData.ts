/**
 * Checks if a game exists in the source data
 * @param game The game to check (array of numbers)
 * @param sourceData The source data to check against (array of string arrays)
 * @returns True if the game exists in the source data, false otherwise
 */
export function checkGameInSourceData(game: number[], sourceData: string[][]): boolean {
  if (!game || !sourceData || !Array.isArray(game) || !Array.isArray(sourceData)) {
    return false;
  }

  // Convert the game numbers to strings for comparison
  const gameAsStrings = game.map(num => num.toString());
  
  // Sort the game numbers to ensure consistent comparison
  const sortedGameAsStrings = [...gameAsStrings].sort();
  
  // Check if the game exists in the source data
  return sourceData.some(sourceGame => {
    // Sort the source game numbers to ensure consistent comparison
    const sortedSourceGame = [...sourceGame].sort();
    
    // Check if the games have the same length
    if (sortedGameAsStrings.length !== sortedSourceGame.length) {
      return false;
    }
    
    // Check if all numbers in the game match the source game
    return sortedGameAsStrings.every((num, index) => num === sortedSourceGame[index]);
  });
}
