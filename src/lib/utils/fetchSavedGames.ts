import {SavedGamesParams, UserGamesRepository} from "@lib/domains/userGames/repository";
import {AxiosService} from "@lib/Network/AxiosService";

export async function fetchSavedGames(params?: SavedGamesParams) {
  const repository = new UserGamesRepository(new AxiosService());
  try {
    return await repository.getGamesByEmail(params);
  } catch (error) {
    console.error("Error fetching saved games:", error);
    throw new Error("Failed to fetch saved games data");
  }
}
