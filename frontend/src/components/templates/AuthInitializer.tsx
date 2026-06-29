// src/components/templates/AuthInitializer.tsx

import { useEffect, useState } from 'react';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { refreshSession } = useAuth();

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  return children;
}