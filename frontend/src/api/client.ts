// src/api/client.ts

/// <reference types="vite/client" />

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';
import { notifications } from '@mantine/notifications'; 

// ── IMPORTANT ──
// Make sure VITE_API_URL is set in your frontend .env file.
// If not, it defaults to http://localhost:8081 (matches your SERVER_PORT)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----- Request Interceptor: Attach Bearer Token -----
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ----- Response Interceptor: 429 → notify, 401 → Refresh -----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      notifications.show({
        title: 'Too many requests',
        message: `Please wait ${retryAfter} seconds before trying again.`,
        color: 'orange',
      });
      return Promise.reject(error);
    }

    // Only trigger refresh on 401 (Unauthorized) to prevent instant logout loops from 403s
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint (outside api instance to avoid interceptor loop)
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          null,
          {
            headers: {
              'X-Refresh-Token': refreshToken,
            },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update store with new tokens
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – logout and redirect
        useAuthStore.getState().logout();
        // Avoid redirect loop by checking if we're already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);