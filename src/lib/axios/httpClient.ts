import { ApiResponse } from '@/types/api.type';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}
const axiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Set a timeout of 10 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
}
export interface ApiOptions {
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

const httpGet = async (endpoint: string, options: ApiOptions) => {
  try {
    const response = await axiosInstance().get(endpoint,{ 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error);
    throw error;
  }
}

const httpPost = async<TData> (endpoint: string, data: unknown, options: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance().post<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, error);
    throw error;
  }
}

const httpPut = async<TData> (endpoint: string, data: unknown, options: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance().put<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`PUT request to ${endpoint} failed:`, error);
    throw error;
  }
}
const httpPatch = async<TData> (endpoint: string, data: unknown, options: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance().patch<ApiResponse<TData>>(endpoint, data, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`PATCH request to ${endpoint} failed:`, error);
    throw error;
  }
}
const httpDelete = async<TData> (endpoint: string, options: ApiOptions): Promise<ApiResponse<TData>> => {
  try {
    const response = await axiosInstance().delete<ApiResponse<TData>>(endpoint, { 
        params: options?.params, 
        headers: options?.headers });
    return response.data;
  } catch (error) {
    console.error(`DELETE request to ${endpoint} failed:`, error);
    throw error;
  }
}
export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};