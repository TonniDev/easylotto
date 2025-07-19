"use client";

import { useState } from "react";
import { GeneratedGameCard } from "../../generator/components/GeneratedGameCard";
import { Button } from "@heroui/react";

interface PaginatedCardsViewerProps {
  games: string[][];
  pageSize?: number;
}

export default function PaginatedCardsViewer({ 
  games, 
  pageSize = 10 
}: PaginatedCardsViewerProps) {
  const [visibleItems, setVisibleItems] = useState(pageSize);
  const [selectedGames, setSelectedGames] = useState<number[]>([]);

  // Function to toggle game selection
  const toggleGameSelection = (index: number) => {
    setSelectedGames(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Function to load more items
  const loadMore = () => {
    setVisibleItems(prev => prev + pageSize);
  };

  // Get the games in reverse order (from last to first)
  const reversedGames = [...games].reverse();
  
  // Get only the visible games
  const visibleGames = reversedGames.slice(0, visibleItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lotofacil Historical Games</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {visibleGames.map((game, index) => (
          <div key={index} className="mb-4">
            <GeneratedGameCard
              set={game.map(n => parseInt(n))}
              index={reversedGames.length - 1 - index}
              selectedGames={selectedGames}
              toggleGameSelection={toggleGameSelection}
              sourceData={games}
            />
          </div>
        ))}
      </div>
      
      {visibleItems < reversedGames.length && (
        <div className="flex justify-center mt-8 mb-8">
          <Button 
            color="primary" 
            onPress={loadMore}
            className="px-6 py-2"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
