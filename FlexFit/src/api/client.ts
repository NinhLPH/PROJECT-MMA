import axios from "axios";
import { Platform } from "react-native";

import { toApiError } from "@/api/errors";

const API_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = `http://${API_HOST}:5000/api`;
export const API_TIMEOUT_MS = 10_000;

let authToken: string | null = null;

export function setAuthToken(token: string): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.set("Authorization", `Bearer ${authToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
