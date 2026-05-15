import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { api, setAccessTokenGetter, setLogoutHandler } from "../api/axios.js";

export const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("refreshToken");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;
    const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken });
    setAccessToken(data.access_token);
    return data.access_token;
  }, []);

  const loadMe = useCallback(async (token) => {
    const request = token
      ? axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      : api.get("/api/auth/me");
    const { data } = await request;
    setUser(data);
  }, []);

  const login = useCallback(async (username, password) => {
    const body = new URLSearchParams({ username, password });
    const { data } = await axios.post(`${API_URL}/api/auth/login`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    setAccessToken(data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    const { data: me } = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    setUser(me);
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await axios.post(`${API_URL}/api/auth/signup`, payload);
    return data;
  }, []);

  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  useEffect(() => {
    function handleRefresh(event) {
      setAccessToken(event.detail);
      loadMe(event.detail).catch(() => {});
    }
    window.addEventListener("token-refreshed", handleRefresh);
    return () => window.removeEventListener("token-refreshed", handleRefresh);
  }, [loadMe]);

  useEffect(() => {
    let active = true;
    refresh()
      .then((token) => {
        if (token && active) {
          return loadMe(token);
        }
      })
      .catch(() => localStorage.removeItem("refreshToken"))
      .finally(() => active && setBootstrapping(false));
    return () => {
      active = false;
    };
  }, [refresh, loadMe]);

  const value = useMemo(
    () => ({
      accessToken,
      bootstrapping,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      refresh,
      signup,
      setAccessToken,
      setUser,
      user
    }),
    [accessToken, bootstrapping, login, logout, refresh, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
