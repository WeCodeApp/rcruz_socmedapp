import { ref } from "vue";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { useUserStore } from "@/stores/user";

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

export function useApi() {
  const userStore = useUserStore();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(async (config) => {
    if (userStore.isAuthenticated && userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await userStore.refreshToken();

          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  async function request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const loading = ref(true);
    const data = ref<T | null>(null);
    const error = ref<string | null>(null);
    const status = ref<number | null>(null);

    try {
      const response: AxiosResponse<T> = await api(config);
      data.value = response.data;
      status.value = response.status;
      return {
        data: data.value,
        loading: false,
        error: null,
        status: status.value,
      };
    } catch (err: any) {
      error.value =
        err.response?.data?.message || err.message || "An error occurred";
      status.value = err.response?.status || null;
      console.error("API Error:", error.value, err);
      return {
        data: null,
        loading: false,
        error: error.value,
        status: status.value,
      };
    } finally {
      loading.value = false;
    }
  }

  async function get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return request<T>({ method: "GET", url, params });
  }

  async function post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return request<T>({ method: "POST", url, data });
  }

  async function put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return request<T>({ method: "PUT", url, data });
  }

  async function del<T>(url: string): Promise<ApiResponse<T>> {
    return request<T>({ method: "DELETE", url });
  }

  return {
    request,
    get,
    post,
    put,
    delete: del,
  };
}
