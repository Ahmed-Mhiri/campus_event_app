import { useEffect, useState, useCallback } from 'react';
import { Center, Loader } from '@mantine/core';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { setTokens, logout, isAuthenticated } = useAuthStore();

  const performSilentRefresh = useCallback(async () => {
    // Read directly from Zustand to avoid React dependency loops
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    if (!currentRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        null,
        {
          headers: { 'X-Refresh-Token': currentRefreshToken },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [setTokens, logout]);

  useEffect(() => {
    let silentRefreshTimer: ReturnType<typeof setInterval>;

    if (isAuthenticated) {
      // THE FIX: We removed the aggressive immediate refresh on boot!
      // We now trust the persisted accessToken in your browser. 
      // If it happens to be expired, your incredible client.ts interceptor 
      // will smoothly catch the 401 and refresh it automatically behind the scenes.

      // We only start the background timer to refresh preemptively every 14 minutes
      const refreshBuffer = 14 * 60 * 1000;
      silentRefreshTimer = setInterval(performSilentRefresh, refreshBuffer);
    }

    // Release the loading screen instantly so the app feels lightning fast
    setLoading(false);

    return () => {
      if (silentRefreshTimer) clearInterval(silentRefreshTimer);
    };
  }, [isAuthenticated, performSilentRefresh]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" color="brand" />
      </Center>
    );
  }

  return <>{children}</>;
}