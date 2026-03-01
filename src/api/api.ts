// api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Base url
// const API_BASE_URL = "http://localhost:5000/api";

// this is production url
const API_BASE_URL = "https://server.moteltrips.com/api";

// Helper to get token from localStorage
const getToken = (): string | null => localStorage.getItem("accessToken");

// Axios instance with token
const axiosWithToken: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to request if available
axiosWithToken.interceptors.request.use((config: any) => {
  const token = getToken();
  if (token) {
    if (!config.headers) config.headers = {} as any;
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Axios instance without token
const axiosWithoutToken: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// CRUD Operations with token
export const apiGet = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axiosWithToken.get<T>(url, config);

export const apiPost = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axiosWithToken.post<T>(url, data, config);

export const apiPut = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axiosWithToken.put<T>(url, data, config);

export const apiPatch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> =>
  axiosWithToken.patch<T>(url, data, config);



export const apiDelete = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> =>
  axiosWithToken.delete<T>(url, { ...config, data });

// CRUD Operations without token
export const apiGetWithoutToken = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axiosWithoutToken.get<T>(url, config);

export const apiPostWithoutToken = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axiosWithoutToken.post<T>(url, data, config);

// File upload with token
export const apiUploadFile = <T = any>(
  url: string,
  file: File | Blob,
  fieldName = "file",
  extraData: Record<string, any> = {},
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  Object.entries(extraData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return axiosWithToken.post<T>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};

// File upload without token
export const apiUploadFileWithoutToken = <T = any>(
  url: string,
  file: File | Blob,
  fieldName = "file",
  extraData: Record<string, any> = {},
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  Object.entries(extraData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return axiosWithoutToken.post<T>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};

export async function getMotelById(id: number) {
  const response = await apiGet(`/motels/${id}`);
  return response.data;
}

