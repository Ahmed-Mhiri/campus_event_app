// src/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';
import type {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserPreferences,
} from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth, logout: storeLogout, updateUser: updateStoreUser } = useAuthStore();

  // ----- Authentication Mutations -----
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const authData = response.data.data;
      if (authData) {
        setAuth(authData);
        notifications.show({
          title: 'Welcome back!',
          message: `Hello ${authData.user.displayName}`,
          color: 'green',
        });

        if (authData.user.role === 'ADMIN') {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else {
          navigate(ROUTES.HOME);
        }
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Login failed. Please try again.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      notifications.show({
        title: 'Registration successful!',
        message: 'Please check your email to verify your account.',
        color: 'green',
      });
      navigate(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Registration failed.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      notifications.show({ message: 'Logged out successfully', color: 'blue' });
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      storeLogout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => authApi.verify(token),
    onSuccess: () => {
      notifications.show({
        title: 'Email verified!',
        message: 'You can now log in.',
        color: 'green',
      });
      navigate(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Verification failed. The link may be expired.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      notifications.show({
        title: 'Verification email sent',
        message: 'Please check your inbox.',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Could not resend verification.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      notifications.show({
        title: 'Check your email',
        message: 'If that email is registered, we sent a reset link.',
        color: 'green',
      });
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      notifications.show({
        title: 'Check your email',
        message: 'If that email is registered, we sent a reset link.',
        color: 'green',
      });
      navigate(ROUTES.LOGIN);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      notifications.show({
        title: 'Password reset successful',
        message: 'You can now log in with your new password.',
        color: 'green',
      });
      navigate(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Reset failed. The link may be expired.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Profile Mutations (with token refresh handling) -----

  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => authApi.updateProfile(formData),
    onSuccess: (response) => {
      const payload = response.data.data as any;

      if (payload?.accessToken && payload?.user) {
        setAuth(payload);
      } else if (payload) {
        updateStoreUser(payload);
      }

      // ✅ CRITICAL: Bust the profile caches so the new avatar appears instantly
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });

      notifications.show({
        title: 'Profile updated',
        message: 'Your changes have been saved.',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update profile.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: (response) => {
      const payload = response?.data?.data as any;

      if (payload?.accessToken && payload?.user) {
        setAuth(payload);
      }

      notifications.show({
        title: 'Password changed',
        message: 'Your password has been updated successfully.',
        color: 'green',
      });
      navigate(ROUTES.PROFILE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to change password.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      notifications.show({
        title: 'Account deleted',
        message: 'We are sad to see you go. Your data has been removed.',
        color: 'blue',
      });
      navigate(ROUTES.HOME);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete account.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Queries -----

  const trustStatusQuery = useQuery({
    queryKey: ['trust-status'],
    queryFn: () => authApi.getTrustStatus().then((res) => res.data.data),
    enabled: !!useAuthStore.getState().isAuthenticated,
  });

  const preferencesQuery = useQuery({
    queryKey: ['preferences'],
    queryFn: () => authApi.getPreferences().then((res) => res.data.data),
    enabled: !!useAuthStore.getState().isAuthenticated,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: UserPreferences) => authApi.updatePreferences(data),
    onSuccess: (response) => {
      notifications.show({
        title: 'Preferences saved',
        message: 'Your settings have been updated.',
        color: 'green',
      });
      queryClient.setQueryData(['preferences'], response.data.data);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update preferences.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });

  // ----- Silent refresh -----
  const refreshSession = async (): Promise<boolean> => {
    const { refreshToken, isAuthenticated } = useAuthStore.getState();
    if (!refreshToken || isAuthenticated) return true;

    try {
      const response = await authApi.refresh(refreshToken);
      const authData = response.data.data;
      if (authData) {
        setAuth(authData);
        return true;
      }
      return false;
    } catch {
      storeLogout();
      return false;
    }
  };

  // ----- Return everything -----
  return {
    // Auth
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    verify: verifyMutation.mutateAsync,
    resendVerification: resendVerificationMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,

    // Profile
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,

    // Status flags
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResetting: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,

    // Queries
    trustStatus: trustStatusQuery.data,
    trustStatusLoading: trustStatusQuery.isLoading,
    refetchTrustStatus: trustStatusQuery.refetch,
    preferences: preferencesQuery.data,
    preferencesLoading: preferencesQuery.isLoading,
    updatePreferences: updatePreferencesMutation.mutateAsync,

    // Session
    refreshSession,

    // Store access
    user: useAuthStore((state) => state.user),
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
  };
}