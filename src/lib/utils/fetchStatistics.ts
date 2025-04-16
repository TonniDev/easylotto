import {StatisticsRepository} from "@lib/domains/statistics/repository";
import {AxiosService} from "@lib/Network/AxiosService";

export async function fetchStatistics() {
  const repository = new StatisticsRepository(new AxiosService());
  try {
    return await repository.getStatistics();
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw new Error("Failed to fetch statistics data");
  }
}
