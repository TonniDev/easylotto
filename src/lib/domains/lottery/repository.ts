import {Lotofacil} from "@lib/definitions/lotofacil";
import {AxiosService} from "@lib/Network/AxiosService";
import {INetworkService, IRequestConfig} from "@lib/Network/types";
import {AxiosResponse} from "axios";

export interface GetHistoricalDataPayload {
  range?: number;
  start?: number;
  throttling?: number;
}

export interface GetItemPayload {
  number?: number;
}

export interface ILotteryRepository {
  getHistoricalData(config: IRequestConfig<GetHistoricalDataPayload>): Promise<Lotofacil[]>;
  getItem(config?: IRequestConfig<GetItemPayload>): Promise<Lotofacil>;
  getCurrentGameNumber(): Promise<number>;
}

export class LotteryRepository implements ILotteryRepository {

  BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
  LOTOFACIL_URL = '/lotofacil';

  constructor(private readonly networkService: AxiosService<
    Lotofacil,
    GetHistoricalDataPayload,
    Record<string, any>
  >) {
    this.networkService = networkService;
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getItem(config?: IRequestConfig<GetItemPayload>): Promise<Lotofacil> {
    const {data, ...requestConfig} = config || {};
    const gameNumber = data?.number || '';
    const response = await this.networkService.get(`${this.LOTOFACIL_URL}/${gameNumber || ''}`, {
      baseURL: this.BASE_URL,
      ...requestConfig
    });

    return response.data;
  }

  async getCurrentGameNumber(): Promise<number> {
    const response = await this.getItem();

    return response.numero;
  }

  async getHistoricalData({
    data: payload,
    ...config
  }: IRequestConfig<GetHistoricalDataPayload>): Promise<Lotofacil[]> {

    const fetchData = async (start: number, accumulatedResults: Lotofacil[]): Promise<Lotofacil[]> => {
      if (start > (payload?.range || 10)) {
        // Stop recursion when the range is covered
        return accumulatedResults;
      }

      const request = this.networkService.get(
        `${this.LOTOFACIL_URL}/${start}`,
        {
          baseURL: this.BASE_URL,
          ...config
        }
      );

      try {
        const response: AxiosResponse<Lotofacil> = await request;

        // Add response data to the result array
        accumulatedResults.push(response.data);

        // Wait for the throttling period
        await this.sleep(payload?.throttling || 1000);

        // Continue fetching the next item (increment start)
        return fetchData(start + 1, accumulatedResults);
      } catch (e) {
        console.log('@tonni ERROR: ', e, request);
        throw e;
      }
      // Send request for the current item
    };

    // Start recursive fetching
    return fetchData(payload?.start || 1, []);
  }
}
