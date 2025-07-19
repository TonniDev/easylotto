import {AxiosService} from "@lib/Network/AxiosService";

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
  error?: Error | unknown;
}

export interface SavedGame {
  id: string;
  email: string;
  name: string;
  listaDezenas: string[];
}

export interface SavedGamesParams {
  email?: string;
  name?: string;
}

export interface IUserGamesRepository {
  saveGames(data: SaveGameData): Promise<SaveGameData[]>;
  getGamesByEmail(params?: SavedGamesParams): Promise<SavedGame[]>;
}

export class UserGamesRepository implements IUserGamesRepository {

  BASE_URL = '/games';
  SAVE_URL = '/save';
  SAVED_GAMES_URL = '/saved';

  constructor(
    private readonly networkService: AxiosService<SaveGameData[], SaveGameData, Record<string, string>>,
  ) {
    this.networkService = networkService;
  }

  async saveGames(data: SaveGameData): Promise<SaveGameData[]> {
    const response = await this.networkService.post(
      `${this.BASE_URL}${this.SAVE_URL}`, { data: data }
    );
    return response.data;
  }

  async getGamesByEmail(params?: {email?: string; name?: string}): Promise<SavedGame[]> {
    const {email, name} = params || {};
    let paramsString = '';
    if (email) {
      paramsString += `email=${email}`;
    }
    if (name) {
      paramsString += `${email ? '&' : ''}name=${name}`;
    }
    if (paramsString) {
      paramsString = `?${paramsString}`;
    }

    const games = await this.networkService.get(`${this.BASE_URL}${this.SAVED_GAMES_URL}${paramsString}`);
    return games.data;

  }
}
