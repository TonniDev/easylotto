import {AxiosService} from "@lib/Network/AxiosService";

export interface BaseGameData {
  email: string;
  name: string;
  group: string | null;
}

export interface SaveGameData extends BaseGameData {
  numbers: number[][];
}

export interface SavedGame extends BaseGameData {
  id: string;
  listaDezenas: string[];
}

export interface SavedGameResponse extends BaseGameData {
  id: string;
  numbers: string[];
}

// Interface for the API response when saving games
export interface SaveGameResult {
  success: boolean;
  message: string;
  savedGames?: SavedGameResponse[];
  error?: Error | unknown;
}

export interface SavedGamesParams {
  email?: string;
  name?: string;
  group?: string;
}

export interface IUserGamesRepository {
  saveGames(data: SaveGameData): Promise<SaveGameResult>;
  getGamesByEmail(params?: SavedGamesParams): Promise<SavedGame[]>;
}

export class UserGamesRepository implements IUserGamesRepository {

  BASE_URL = '/games';
  SAVE_URL = '/save';
  SAVED_GAMES_URL = '/saved';

  constructor(
    private readonly networkService: AxiosService<SaveGameResult | SavedGame[], SaveGameData, Record<string, string>>,
  ) {
    this.networkService = networkService;
  }

  async saveGames(data: SaveGameData): Promise<SaveGameResult> {
    const response = await this.networkService.post(
      `${this.BASE_URL}${this.SAVE_URL}`, { data: data }
    );
    return response.data as SaveGameResult;
  }

  async getGamesByEmail(params?: SavedGamesParams): Promise<SavedGame[]> {
    const {email, name, group} = params || {};
    let paramsString = '';
    if (email) {
      paramsString += `email=${email}`;
    }
    if (name) {
      paramsString += `${paramsString ? '&' : ''}name=${name}`;
    }
    if (group) {
      paramsString += `${paramsString ? '&' : ''}group=${group}`;
    }
    if (paramsString) {
      paramsString = `?${paramsString}`;
    }

    const games = await this.networkService.get(`${this.BASE_URL}${this.SAVED_GAMES_URL}${paramsString}`);
    return games.data as SavedGame[];

  }
}
