import { ApiResponse } from '@/types/api.type';
import axios from 'axios';
import http from 'http';
import https from 'https';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

const isServer = typeof window === 'undefined';
const httpAgent = isServer ? new http.Agent({ keepAlive: true, maxSockets: 50 }) : undefined;
const httpsAgent = isServer ? new https.Agent({ keepAlive: true, maxSockets: 50 }) : undefined;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  httpAgent,
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiOptions {
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TData>>(endpoint, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

const httpPost = async <TData>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

const httpPut = async <TData>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance.put<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`PUT request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

const httpPatch = async <TData>(endpoint: string, data?: unknown, options?: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`PATCH request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

const httpDelete = async <TData>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<TData>>(endpoint, { 
      params: options?.params, 
      headers: options?.headers 
    });
    return response.data;
  } catch (error) {
    console.error(`DELETE request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

const httpPostWithMeta = async <TData>(
  endpoint: string,
  data?: unknown,
  options?: ApiOptions
): Promise<{ data: ApiResponse<TData>; headers: Record<string, any> }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TData>>(endpoint, data, {
      params: options?.params,
      headers: options?.headers,
    });
    return {
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, (error as any)?.message || error);
    throw error;
  }
};

export const httpClient = {
  get: httpGet,
  post: httpPost,
  postWithMeta: httpPostWithMeta,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};