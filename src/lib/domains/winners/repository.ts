import {Winners} from "@lib/definitions/winners";
import {AxiosService} from "@lib/Network/AxiosService";
import {IRequestConfig} from "@lib/Network/types";

export interface IWinnersRepository {
  getWinners(config?: IRequestConfig): Promise<Winners>;
}

export class WinnersRepository implements IWinnersRepository {

  BASE_URL = 'winners';
  WINNERS_BY_STATE_URL = '/by-state';

  constructor(private readonly networkService: AxiosService<
    Winners,
    undefined,
    Record<string, any>
  >) {
    this.networkService = networkService;
  }

  async getWinners(config?: IRequestConfig<undefined>): Promise<Winners> {
    const response = await this.networkService.get(`${this.BASE_URL}${this.WINNERS_BY_STATE_URL}`, config);

    return response.data;
  }
}
