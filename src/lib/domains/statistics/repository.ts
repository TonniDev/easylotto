import {AxiosService} from "@lib/Network/AxiosService";
import {IRequestConfig} from "@lib/Network/types";

interface IStatisticItem {
  statKey: string;
  value: number;
  lastoccurrence: number;
}

export interface IStatisticsResponse {
  lastLotteryNumber: number,
  results: IStatisticItem[]
}

export class StatisticsRepository {
  STATISTICS_URL = '/games/statistics';

  constructor(
    private readonly networkService: AxiosService<IStatisticsResponse, undefined, Record<string, string | number>>,
  ) {
    this.networkService = networkService;
  }

  async getStatistics(config?: IRequestConfig<undefined>): Promise<IStatisticsResponse> {
    const response = await this.networkService.get(`${this.STATISTICS_URL}?occurrences_lte=100&includeGames=true`, config);

    return response.data;
  }
}
