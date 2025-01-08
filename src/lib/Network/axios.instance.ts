import axios from "axios";
import qs from "qs";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 60_000,
  paramsSerializer: (params: Record<string, unknown>) =>
    qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true }),
});
