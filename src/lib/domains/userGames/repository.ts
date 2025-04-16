import {AxiosService} from "@lib/Network/AxiosService";
import {prisma} from "@lib/prisma";

export interface SaveGameData {
  email: string;
  name: string;
  numbers: number[][];
}

export interface SaveGameResult {
  success: boolean;
  message: string;
  savedGames?: Array<{
    id: string;
    email: string;
    name: string;
    numbers: string[];
  }>;
  error?: any;
}

export interface IUserGamesRepository {
  saveGames(data: SaveGameData): Promise<SaveGameData[]>;

  getGamesByEmail(email: string): Promise<any>;
}

export class UserGamesRepository implements IUserGamesRepository {

  BASE_URL = '/games/save';

  constructor(
    private readonly networkService: AxiosService<SaveGameData[], SaveGameData, Record<string, string>>,
  ) {
    this.networkService = networkService;
  }

  async saveGames(data: SaveGameData): Promise<SaveGameData[]> {
    const response = await this.networkService.post(
      this.BASE_URL, { data: data }
    );
    return response.data;
  }

  async getGamesByEmail(email: string): Promise<any> {
    try {
      const games = await prisma.saved_games.findMany({
        where: {
          email,
        },
        orderBy: {
          created: 'desc',
        },
      });

      return {
        success: true,
        games,
      };
    } catch (error) {
      console.error("Error fetching games:", error);
      return {
        success: false,
        message: "Failed to fetch games",
        error,
      };
    }
  }
}
