import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});


let getAccessToken = () => null;
let logoutHandler = () => {};
let refreshPromise = null;

export function setAccessTokenGetter(getter) {
  getAccessToken = getter;
}

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      if (error.response?.status === 401) logoutHandler();
      return Promise.reject(error);
    }
    original._retry = true;
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logoutHandler();
      return Promise.reject(error);
    }
    try {
      refreshPromise =
        refreshPromise ||
        axios
          .post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken })
          .finally(() => {
            refreshPromise = null;
          });
      const { data } = await refreshPromise;
      original.headers.Authorization = `Bearer ${data.access_token}`;
      window.dispatchEvent(new CustomEvent("token-refreshed", { detail: data.access_token }));
      return api(original);
    } catch (refreshError) {
      logoutHandler();
      return Promise.reject(refreshError);
    }
  }
);
