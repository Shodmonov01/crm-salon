import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStorage } from '@/shared/api/client';
import { useRefreshToken } from '@/shared/api/hooks/useAuth';
import { AUTH_ENABLED } from '@/shared/config/env';

export const ProtectedRoute: React.FC = () => {
  const refreshToken = useRefreshToken();

  React.useEffect(() => {
    // Очистить localStorage если AUTH отключён (для dev)
    authStorage.clearIfAuthDisabled();

    if (AUTH_ENABLED && authStorage.isAuthenticated()) {
      refreshToken.mutate();
    }
  }, []);

  if (AUTH_ENABLED && !authStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
