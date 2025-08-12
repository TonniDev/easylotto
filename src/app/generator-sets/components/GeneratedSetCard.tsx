"use client";

import {Card, CardBody, CardFooter, CardHeader} from "@heroui/card";
import {Button, Chip} from "@heroui/react";
import {checkGameInSourceData} from "@lib/utils/checkGameInSourceData";

interface GeneratedSetCardProps {
  group: {
    name: string;
    numbers: number[][];
  };
  index: number;
  selectedGroups: number[];
  toggleGroupSelection: (index: number) => void;
  sourceData: string[][];
}

export const GeneratedSetCard = ({
  group,
  index,
  selectedGroups,
  toggleGroupSelection,
  sourceData
}: GeneratedSetCardProps) => {
  const isSelected = selectedGroups.includes(index);
  
  // Check if any game in this group exists in the source data
  const existingGames = group.numbers.map(game => {
    const sortedGame = [...game].sort((a, b) => a - b);
    return checkGameInSourceData(sortedGame, sourceData);
  });
  
  const hasExistingGames = existingGames.some(exists => exists);

  return (
    <Card
      className={`border-2 ${isSelected ? 'border-primary' : 'border-gray-200'}`}
      isPressable
      onPress={() => toggleGroupSelection(index)}
    >
      <CardHeader className="flex justify-between items-center">
        <div className="text-xl font-bold">{group.name}</div>
        <div className="flex gap-2">
          <Chip color="primary">{group.numbers.length} Games</Chip>
          {hasExistingGames && (
            <Chip color="warning">Contains existing games</Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {group.numbers.map((game, gameIndex) => {
            const sortedGame = [...game].sort((a, b) => a - b);
            const gameExists = existingGames[gameIndex];
            
            return (
              <div 
                key={`game_${gameIndex}`}
                className={`p-3 rounded-md ${gameExists ? 'bg-yellow-100' : 'bg-gray-100'}`}
              >
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {sortedGame.map((num, numIndex) => (
                    <span 
                      key={`num_${numIndex}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-center text-gray-600">Game {gameIndex + 1}</div>
              </div>
            );
          })}
        </div>
      </CardBody>
      <CardFooter>
        <Button
          color={isSelected ? "primary" : "default"}
          variant={isSelected ? "solid" : "bordered"}
          onPress={() => toggleGroupSelection(index)}
          className="w-full"
        >
          {isSelected ? "Selected" : "Select Group"}
        </Button>
      </CardFooter>
    </Card>
  );
};
