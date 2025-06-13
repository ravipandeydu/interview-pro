"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/authService";
import { useAuth as useAuthStore } from "../store/useStore";
import { tokenManager } from "../lib/api";
import type { RegisterFormData } from "../lib/zod-schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Query keys for React Query
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

/**
 * Custom hook for authentication using React Query + Zustand
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useAuthStore();

  // Query for getting current session
  const sessionQuery = useQuery({
    queryKey: authKeys.session(),
    queryFn: AuthService.getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!tokenManager.getToken() && !isAuthenticated && !user, // Only fetch if token exists, not authenticated, and no user data
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (session) => {
      setUser(session?.data?.user);
      setLoading(false);
      toast.success("Login successful!");
      router.push("/dashboard");
      // Invalidate and refetch session
      queryClient.setQueryData(authKeys.session(), session);
    },
    onError: (error) => {
      setLoading(false);
      toast.error("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: Omit<RegisterFormData, "confirmPassword">) =>
      AuthService.register(userData),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (session) => {
      setUser(session.user);
      setLoading(false);
      toast.success("Account created successfully!");
      router.push("/login");
      // Invalidate and refetch session
      queryClient.setQueryData(authKeys.session(), session);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      console.error("Registration failed:", error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      logoutStore();
      setLoading(false);
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Optionally clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      setLoading(false);
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local state
      logoutStore();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
    onSettled: () => {
      // Always ensure token is removed from localStorage
      tokenManager.removeToken();
    },
  });

  // Password reset request mutation
  const requestPasswordResetMutation = useMutation({
    mutationFn: AuthService.requestPasswordReset,
    onError: (error) => {
      console.error("Password reset request failed:", error);
    },
  });

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => AuthService.resetPassword(token, newPassword),
    onError: (error) => {
      console.error("Password reset failed:", error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => AuthService.changePassword(currentPassword, newPassword),
    onError: (error) => {
      console.error("Change password failed:", error);
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: AuthService.refreshToken,
    onSuccess: (session) => {
      setUser(session.user);
      queryClient.setQueryData(authKeys.session(), session);
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      logoutStore();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: AuthService.verifyEmail,
    onSuccess: () => {
      // Refetch session to get updated user data
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: AuthService.resendVerification,
    onError: (error) => {
      console.error("Resend verification failed:", error);
    },
  });

  // Initialize session on mount
  React.useEffect(() => {
    if (sessionQuery.data && !isAuthenticated) {
      setUser(sessionQuery.data.user);
    }
  }, [sessionQuery.data, isAuthenticated, setUser]);

  // Check for existing token on mount and validate session
  React.useEffect(() => {
    const token = tokenManager.getToken();
    if (token && !isAuthenticated && !sessionQuery.isFetching && !sessionQuery.data) {
      // If we have a token but no user, try to fetch the session
      sessionQuery.refetch();
    }
  }, [isAuthenticated, sessionQuery.isFetching, sessionQuery.data, sessionQuery]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || sessionQuery.isLoading,

    // Session query
    sessionQuery,

    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    logoutError: logoutMutation.error,

    requestPasswordReset: requestPasswordResetMutation.mutate,
    requestPasswordResetAsync: requestPasswordResetMutation.mutateAsync,
    isRequestingPasswordReset: requestPasswordResetMutation.isPending,
    requestPasswordResetError: requestPasswordResetMutation.error,

    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,

    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,

    refreshToken: refreshTokenMutation.mutate,
    refreshTokenAsync: refreshTokenMutation.mutateAsync,
    isRefreshingToken: refreshTokenMutation.isPending,
    refreshTokenError: refreshTokenMutation.error,

    verifyEmail: verifyEmailMutation.mutate,
    verifyEmailAsync: verifyEmailMutation.mutateAsync,
    isVerifyingEmail: verifyEmailMutation.isPending,
    verifyEmailError: verifyEmailMutation.error,

    resendVerification: resendVerificationMutation.mutate,
    resendVerificationAsync: resendVerificationMutation.mutateAsync,
    isResendingVerification: resendVerificationMutation.isPending,
    resendVerificationError: resendVerificationMutation.error,
  };
}

export default useAuth;
