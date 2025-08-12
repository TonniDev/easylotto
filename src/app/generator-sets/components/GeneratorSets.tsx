"use client"

import {GameGeneratorSchema} from "@lib/definitions/generator.schema";
import {fetchGenerateNumbers} from "@lib/utils/fetchGenerateNumbers";
import {useCallback, useState} from "react";
import {GeneratedSets} from "./GeneratedSets";
import GeneratorSetsForm, {GeneratorSetsFormProps, LotofacilSetsFormValues} from "./GeneratorSetsForm";

export const GeneratorSets = ({statistics, allGames}: Pick<GeneratorSetsFormProps, "statistics"> & {allGames: string[][]}) => {
  const [generatedSets, setGeneratedSets] = useState<{
    groups: {
      name: string;
      numbers: number[][];
    }[];
  } | null>(null);

  const onSubmit = useCallback(async (data: LotofacilSetsFormValues) => {
    // Generate the specified number of groups with non-repeating games
    const { numberOfGroups, gamesPerGroup, groupNamePattern } = data;
    
    // Create an array to store all generated games to check for duplicates
    const allGeneratedGames: number[][] = [];
    const groups = [];
    
    // Generate each group
    for (let i = 0; i < numberOfGroups; i++) {
      const groupName = groupNamePattern.replace('{i}', (i + 1).toString());
      const groupGames: number[][] = [];
      
      // Generate games for this group
      for (let j = 0; j < gamesPerGroup; j++) {
        // Generate a new game that doesn't exist in allGeneratedGames
        let newGame: number[] | null = null;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        while (!newGame && attempts < maxAttempts) {
          attempts++;
          // Use the existing generator with the constraints
          const generatedGame = await fetchGenerateNumbers({
            constraints: data.constraints,
            amountOfSets: 1
          });
          
          if (generatedGame && generatedGame.length > 0) {
            const game = generatedGame[0];
            
            // Check if this game already exists in allGeneratedGames
            const isDuplicate = allGeneratedGames.some(existingGame => 
              existingGame.length === game.length && 
              existingGame.every((num, idx) => num === game[idx])
            );
            
            if (!isDuplicate) {
              newGame = game;
            }
          }
        }
        
        if (newGame) {
          groupGames.push(newGame);
          allGeneratedGames.push(newGame);
        } else {
          console.error("Failed to generate a unique game after multiple attempts");
        }
      }
      
      groups.push({
        name: groupName,
        numbers: groupGames
      });
    }
    
    setGeneratedSets({ groups });
  }, []);

  return (
    <>
      <GeneratorSetsForm statistics={statistics} onSubmit={onSubmit} />
      {generatedSets && <GeneratedSets generatedSets={generatedSets} sourceData={allGames} />}
    </>
  )
}
