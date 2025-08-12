"use client";

import {fetchLotofacilAllGames} from "@lib/utils/fetchLotofacilAllGames";
import {useRouter, useSearchParams} from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@heroui/react";
import { fetchSavedGames } from "@lib/utils/fetchSavedGames";
import { SavedGamesParams, SavedGame as SavedGameType } from "@lib/domains/userGames/repository";
import { GeneratedGameCard } from "../generator/components/GeneratedGameCard";
import { useAuth } from "@ui/providers/AuthProvider";

interface SavedGame {
  id: string;
  email: string;
  name: string;
  group?: string;
  listaDezenas: string[];
}

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MyGamesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { getAuthHeaders } = useAuth();
  const groupParam = params.get('group') || undefined;
  const [group, setGroup] = useState<string>(groupParam || "");
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [allGames, setAllGames] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

  // Debounce the group input
  const debouncedGroup = useDebounce(group, 500);

  const fetchAllGames = useCallback(async () => {
    const all = await fetchLotofacilAllGames()
    setAllGames(all);
  }, []);

  // Fetch saved games when debounced group changes
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construct URL with group parameter if provided
      let url = '/my-games';
      if (debouncedGroup) {
        url += `?group=${debouncedGroup}`;
      }
      router.push(url);

      // Fetch saved games with authentication headers
      const response = await fetch(`/api/v1/games/saved${debouncedGroup ? `?group=${debouncedGroup}` : ''}`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSavedGames(result || []);
      } else {
        throw new Error('Failed to fetch saved games');
      }
    } catch (err) {
      console.error("Error fetching saved games:", err);
      setError("Failed to fetch saved games. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedGroup, router, getAuthHeaders]);

  // Initialize group from URL parameter
  useEffect(() => {
    if (groupParam !== undefined) {
      setGroup(groupParam);
    }
  }, [groupParam]);

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (allGames === null) {
      void fetchAllGames();
    }
  }, [allGames, fetchAllGames]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Saved Games</h1>

      <div className="mb-8 max-w-md">
        <label htmlFor="group" className="block text-sm font-medium mb-2">
          Filter by Group
        </label>
        <Input
          id="group"
          type="text"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Search by group (optional)"
          className="w-full"
        />
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {!loading && !error && savedGames.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No saved games found. Try adjusting your search criteria.
        </div>
      )}

      {!loading && !error && savedGames.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-700 flex flex-row flex-wrap justify-between">
            {savedGames.map((game, index) => (
              <li key={game.id} className="p-4 hover:bg-gray-700 max-w-[300px]">
                <p className="font-medium text-white">{game.email}</p>
                <p className="text-sm text-gray-300">Name: {game.name}</p>
                {game.group && <p className="text-sm text-gray-300 mb-4">Group: {game.group}</p>}
                {!game.group && <div className="mb-4"></div>}
                {Array.isArray(game.listaDezenas) && game.listaDezenas.length > 0 && allGames ? (
                  <GeneratedGameCard
                    set={game.listaDezenas.map((n: string) => parseInt(n))}
                    index={index}
                    selectedGames={selectedGames}
                    toggleGameSelection={toggleGameSelection}
                    sourceData={allGames}
                  />
                ) : (
                  <p className="text-sm text-gray-300">No numbers available</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
