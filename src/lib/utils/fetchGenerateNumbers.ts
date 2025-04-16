import {WinnersByState} from "@lib/definitions/winners";
import {LotteryRepository} from "@lib/domains/lottery/repository";
import {WinnersRepository} from "@lib/domains/winners/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import {STATES} from "@lib/utils/constants";
import {GenerateRandomSetsOptions} from "@lib/utils/math/types";

export function groupInvalidStates(data: WinnersByState[]): WinnersByState[] {
  return data.reduce((accumulator, currentItem) => {
    if (STATES.includes(currentItem.state)) {
      accumulator.push(currentItem);
    } else {
      const othersIndex = accumulator.findIndex((item) => item.state === "--");
      if (othersIndex > -1) {
        accumulator[othersIndex].totalWinners += currentItem.totalWinners;
        accumulator[othersIndex].percentage += currentItem.percentage;
      } else {
        accumulator.push({
          ...currentItem,
          state: "--",
        });
      }
    }
    return accumulator;
  }, [] as WinnersByState[])
}

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
