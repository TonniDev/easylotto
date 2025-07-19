"use client";

import {fetchLotofacilAllGames} from "@lib/utils/fetchLotofacilAllGames";
import {useRouter, useSearchParams} from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@heroui/react";
import { fetchSavedGames } from "@lib/utils/fetchSavedGames";
import { SavedGamesParams } from "@lib/domains/userGames/repository";
import { GeneratedGameCard } from "../generator/components/GeneratedGameCard";

interface SavedGame {
  id: string;
  email: string;
  name: string;
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
  const emailParam = params.get('email') || undefined;
  const nameParam = params.get('name') || undefined;
  const [email, setEmail] = useState<string>(emailParam || "");
  const [name, setName] = useState<string>(nameParam || "");
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

  // Debounce the input values
  const debouncedEmail = useDebounce(email, 500);
  const debouncedName = useDebounce(name, 500);

  const fetchAllGames = useCallback(async () => {
    const all = await fetchLotofacilAllGames()
    setAllGames(all);
  }, []);

  // Fetch saved games when debounced inputs change
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: SavedGamesParams = {};
      if (debouncedEmail) params.email = debouncedEmail;
      if (debouncedName) params.name = debouncedName;

      // Construct URL with only defined parameters
      let url = '/my-games';
      const queryParams = [];
      if (params.email !== undefined) queryParams.push(`email=${params.email}`);
      if (params.name !== undefined) queryParams.push(`name=${params.name}`);
      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }
      router.push(url);

      // Fetch saved games with the same parameters
      const result = await fetchSavedGames(params);
      setSavedGames(result || []);
    } catch (err) {
      console.error("Error fetching saved games:", err);
      setError("Failed to fetch saved games. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedEmail, debouncedName, router]);

  useEffect(() => {
    if (emailParam !== undefined && emailParam !== email) {
      setEmail(emailParam);
    }
    if (nameParam !== undefined && nameParam !== name) {
      setName(nameParam);
    }
  }, [email, emailParam, name, nameParam]);

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (allGames === null) {
      void fetchAllGames();
    }
  }, [allGames, fetchAllGames]);

  // This useEffect runs when URL parameters change
  // It's needed to handle direct URL navigation or page refresh
  useEffect(() => {
    // If we have URL parameters, fetch games directly
    if (emailParam !== undefined || nameParam !== undefined) {
      const newParams: Record<string, string> = {};
      if (emailParam !== undefined) {
        newParams['email'] = emailParam;
      }
      if (nameParam !== undefined) {
        newParams['name'] = nameParam;
      }
      fetchSavedGames(newParams).then(setSavedGames);
    }
  }, [emailParam, nameParam, email, name]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Saved Games</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by name"
          />
        </div>
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
                <p className="text-sm text-gray-300 mb-4">Name: {game.name}</p>
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
