import {AxiosRequestConfig, AxiosRequestHeaders} from "axios";

export interface IRequestConfig<PayloadFormat = unknown, ParamsFormat = Record<string, unknown>> extends AxiosRequestConfig<PayloadFormat> {
  headers?: Record<string, string>;
  data?: PayloadFormat;
  params?: ParamsFormat;
  validateStatus?: ((status: number) => boolean) | null;
}

export interface INetworkService<
  ResponseFormat = unknown,
  PayloadFormat = unknown,
  ParamsFormat = Record<string, unknown>,
> {
  getDefaultHeaders(): AxiosRequestHeaders;

  get<Response extends ResponseFormat = ResponseFormat, Params = ParamsFormat>(
    url: string,
    config?: IRequestConfig<PayloadFormat, Params>,
  ): Promise<Response>;

  post<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(
    url: string,
    config?: IRequestConfig<Payload, Params>,
  ): Promise<Response>;

  put<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(
    url: string,
    config?: IRequestConfig<Payload, Params>,
  ): Promise<Response>;

  patch<
    Payload extends PayloadFormat | undefined = PayloadFormat,
    Response extends ResponseFormat = ResponseFormat,
    Params = ParamsFormat,
  >(
    url: string,
    config?: IRequestConfig<Payload, Params>,
  ): Promise<Response>;

  delete<Response extends ResponseFormat = ResponseFormat, Params = ParamsFormat>(
    url: string,
    config?: IRequestConfig<undefined, Params>,
  ): Promise<Response>;
}
