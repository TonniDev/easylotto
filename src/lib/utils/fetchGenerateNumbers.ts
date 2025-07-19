import {LotteryRepository} from "@lib/domains/lottery/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import {GenerateRandomSetsOptions} from "@lib/utils/math/types";

// Server function to fetch and process data
export async function fetchGenerateNumbers(payload: GenerateRandomSetsOptions) {
  const repository = new LotteryRepository(new AxiosService());

  try {
    return await repository.generateNumbers(payload);
  } catch (error) {
    console.error("Error generating numbers:", error);
    throw new Error("Failed to generate numbers");
  }
}
