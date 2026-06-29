// src/components/templates/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export const ProtectedRoute = () => {
  const { isAuthenticated, accessToken } = useAuthStore();

  if (accessToken === null && isAuthenticated === false) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};