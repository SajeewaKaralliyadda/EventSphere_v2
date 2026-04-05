import axios, { type InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

function requestAlreadyHasBearer(config: InternalAxiosRequestConfig): boolean {
  const h = config.headers;
  if (!h) return false;
  if (typeof h.get === "function") {
    return !!(h.get("Authorization") ?? h.get("authorization"));
  }
  const rec = h as Record<string, string | undefined>;
  return !!(rec.Authorization ?? rec.authorization);
}

// Request Interceptor: attach Supabase JWT when a session exists (including invite finalization on /register).
api.interceptors.request.use(
  async (config) => {
    if (requestAlreadyHasBearer(config)) {
      return config;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
