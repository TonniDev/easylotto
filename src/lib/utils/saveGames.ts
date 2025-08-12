import {SaveGameData, SaveGameResult, UserGamesRepository} from "@lib/domains/userGames/repository";
import {AxiosService} from "@lib/Network/AxiosService";

export async function saveGames(data: SaveGameData): Promise<SaveGameResult> {
  if (!data.numbers || !data.name || !data.email) {
    throw new Error("Missing required fields");
  }
  const repository = new UserGamesRepository(new AxiosService());

  try {
    return await repository.saveGames(data);
  } catch (error) {
    console.error("Error saving numbers:", error);
    throw new Error("Failed to save numbers");
  }
}
