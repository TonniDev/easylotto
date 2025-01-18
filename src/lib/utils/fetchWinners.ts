import {WinnersByState} from "@lib/definitions/winners";
import {WinnersRepository} from "@lib/domains/winners/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import {STATES} from "@lib/utils/constants";

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
export async function fetchWinnersRawData() {
  const repository = new WinnersRepository(new AxiosService());

  try {
    return await repository.getWinners();
  } catch (error) {
    console.error("Error fetching winners:", error);
    throw new Error("Failed to fetch winners data");
  }
}

export async function fetchWinners() {
  const winners = await fetchWinnersRawData();

  return {
    ...winners,
    data: groupInvalidStates(winners.data),
  };
}
