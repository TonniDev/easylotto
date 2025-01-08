import {axiosInstance as serviceClient} from "@lib/Network/axios.instance";
import {INetworkService, IRequestConfig} from "@lib/Network/types";
import {AxiosHeaders, AxiosRequestHeaders, AxiosRequestConfig, AxiosResponse} from "axios";

export class AxiosService<ResponseType, PayloadFormat, ParamsFormat, ResponseFormat = AxiosResponse<ResponseType>> implements INetworkService<ResponseFormat, PayloadFormat, ParamsFormat> {

  constructor(readonly serviceInstance = serviceClient) {
    this.serviceInstance = serviceClient;
  }

  getDefaultHeaders(): AxiosRequestHeaders {
    return new AxiosHeaders({
      'Content-Type': 'application/json',
    });
  }

  async get<Response extends ResponseFormat = ResponseFormat, Params = ParamsFormat>(
    url: string,
    config?: IRequestConfig<PayloadFormat, Params>,
  ): Promise<Response> {
    return await this.serviceInstance.get(url, {
      headers: this.getDefaultHeaders(),
      ...config,
    });
  }

  async post<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(url: string, config?: IRequestConfig<Payload, Params>): Promise<Response> {
    return await this.serviceInstance.post(url, config?.data, {
      headers: this.getDefaultHeaders(),
      ...config,
    });
  }

  async put<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(url: string, config?: IRequestConfig<Payload, Params>): Promise<Response> {
    return await this.serviceInstance.put(url, config?.data, {
      headers: this.getDefaultHeaders(),
      ...config,
    });
  }

  async patch<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(url: string, config?: IRequestConfig<Payload, Params>): Promise<Response> {
    return await this.serviceInstance.patch(url, config?.data, {
      headers: this.getDefaultHeaders(),
      ...config,
    });
  }

  async delete<Response extends ResponseFormat = ResponseFormat, Params = ParamsFormat>(
    url: string,
    config?: IRequestConfig<undefined, Params>,
  ): Promise<Response> {
    return await this.serviceInstance.delete(url, {
      headers: this.getDefaultHeaders(),
      ...config,
    });
  }

}
