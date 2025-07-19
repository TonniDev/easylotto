import {LotteryRepository} from "@lib/domains/lottery/repository";
import {AxiosService} from "@lib/Network/AxiosService";

// Server function to fetch and process data
export async function fetchLotofacilAllGames() {
  const repository = new LotteryRepository(new AxiosService());

  try {
    return await repository.getLotofacilHistoricalGamesNumbersOnly();
  } catch (error) {
    console.error("Error generating numbers:", error);
    throw new Error("Failed to generate numbers");
  }
}
