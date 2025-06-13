'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConfigService } from '../services/configService';
import { useConfig as useConfigStore } from '../store/useStore';
import type { AppConfig, FeatureFlag } from '../services/configService';

// Query keys for React Query
export const configKeys = {
  all: ['config'] as const,
  app: () => [...configKeys.all, 'app'] as const,
  features: () => [...configKeys.all, 'features'] as const,
  feature: (featureId: string) => [...configKeys.all, 'feature', featureId] as const,
  health: () => [...configKeys.all, 'health'] as const,
  version: () => [...configKeys.all, 'version'] as const,
  maintenance: () => [...configKeys.all, 'maintenance'] as const,
  rateLimits: () => [...configKeys.all, 'rateLimits'] as const,
  locales: () => [...configKeys.all, 'locales'] as const,
  userConfig: () => [...configKeys.all, 'user'] as const,
};

/**
 * Custom hook for application configuration using React Query + Zustand
 */
export function useConfig() {
  const queryClient = useQueryClient();
  const { enableChat, enableAuth, setConfig } = useConfigStore();

  // App configuration query
  const appConfigQuery = useQuery({
    queryKey: configKeys.app(),
    queryFn: ConfigService.getAppConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Feature flags query
  const featureFlagsQuery = useQuery({
    queryKey: configKeys.features(),
    queryFn: ConfigService.getFeatureFlags,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // Update app config mutation (admin only)
  const updateAppConfigMutation = useMutation({
    mutationFn: ConfigService.updateAppConfig,
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(configKeys.app(), updatedConfig);
      // Update local store with relevant flags
      setConfig({
        enableChat: updatedConfig.features.chat,
        enableAuth: updatedConfig.features.auth,
      });
    },
    onError: (error) => {
      console.error('Update app config failed:', error);
    },
  });

  // Toggle feature flag mutation (admin only)
  const toggleFeatureFlagMutation = useMutation({
    mutationFn: ({ featureId, enabled }: { featureId: string; enabled: boolean }) =>
      ConfigService.toggleFeatureFlag(featureId, enabled),
    onSuccess: (updatedFlag) => {
      // Update the feature flags cache
      queryClient.setQueryData(configKeys.features(), (oldFlags: FeatureFlag[] | undefined) => {
        if (!oldFlags) return [updatedFlag];
        return oldFlags.map(flag => 
          flag.id === updatedFlag.id ? updatedFlag : flag
        );
      });
      // Update individual feature cache
      queryClient.setQueryData(configKeys.feature(updatedFlag.id), updatedFlag);
    },
    onError: (error) => {
      console.error('Toggle feature flag failed:', error);
    },
  });

  // Create feature flag mutation (admin only)
  const createFeatureFlagMutation = useMutation({
    mutationFn: ConfigService.createFeatureFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.features() });
    },
    onError: (error) => {
      console.error('Create feature flag failed:', error);
    },
  });

  // Delete feature flag mutation (admin only)
  const deleteFeatureFlagMutation = useMutation({
    mutationFn: ConfigService.deleteFeatureFlag,
    onSuccess: (_, featureId) => {
      // Remove from features cache
      queryClient.setQueryData(configKeys.features(), (oldFlags: FeatureFlag[] | undefined) => {
        if (!oldFlags) return [];
        return oldFlags.filter(flag => flag.id !== featureId);
      });
      // Remove individual feature cache
      queryClient.removeQueries({ queryKey: configKeys.feature(featureId) });
    },
    onError: (error) => {
      console.error('Delete feature flag failed:', error);
    },
  });

  return {
    // Local state
    enableChat,
    enableAuth,
    setConfig,

    // App configuration
    appConfig: appConfigQuery.data,
    isLoadingAppConfig: appConfigQuery.isLoading,
    appConfigError: appConfigQuery.error,
    refetchAppConfig: appConfigQuery.refetch,

    // Feature flags
    featureFlags: featureFlagsQuery.data,
    isLoadingFeatureFlags: featureFlagsQuery.isLoading,
    featureFlagsError: featureFlagsQuery.error,
    refetchFeatureFlags: featureFlagsQuery.refetch,

    // Update app config
    updateAppConfig: updateAppConfigMutation.mutate,
    updateAppConfigAsync: updateAppConfigMutation.mutateAsync,
    isUpdatingAppConfig: updateAppConfigMutation.isPending,
    updateAppConfigError: updateAppConfigMutation.error,

    // Toggle feature flag
    toggleFeatureFlag: toggleFeatureFlagMutation.mutate,
    toggleFeatureFlagAsync: toggleFeatureFlagMutation.mutateAsync,
    isTogglingFeatureFlag: toggleFeatureFlagMutation.isPending,
    toggleFeatureFlagError: toggleFeatureFlagMutation.error,

    // Create feature flag
    createFeatureFlag: createFeatureFlagMutation.mutate,
    createFeatureFlagAsync: createFeatureFlagMutation.mutateAsync,
    isCreatingFeatureFlag: createFeatureFlagMutation.isPending,
    createFeatureFlagError: createFeatureFlagMutation.error,

    // Delete feature flag
    deleteFeatureFlag: deleteFeatureFlagMutation.mutate,
    deleteFeatureFlagAsync: deleteFeatureFlagMutation.mutateAsync,
    isDeletingFeatureFlag: deleteFeatureFlagMutation.isPending,
    deleteFeatureFlagError: deleteFeatureFlagMutation.error,
  };
}

/**
 * Hook for checking if a specific feature is enabled
 */
export function useFeatureFlag(featureId: string) {
  return useQuery({
    queryKey: configKeys.feature(featureId),
    queryFn: () => ConfigService.isFeatureEnabled(featureId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for system health monitoring
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: configKeys.health(),
    queryFn: ConfigService.getSystemHealth,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook for version information
 */
export function useVersionInfo() {
  return useQuery({
    queryKey: configKeys.version(),
    queryFn: ConfigService.getVersionInfo,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for maintenance status
 */
export function useMaintenanceStatus() {
  const queryClient = useQueryClient();

  const maintenanceQuery = useQuery({
    queryKey: configKeys.maintenance(),
    queryFn: ConfigService.getMaintenanceStatus,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  const setMaintenanceModeMutation = useMutation({
    mutationFn: ConfigService.setMaintenanceMode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.maintenance() });
    },
    onError: (error) => {
      console.error('Set maintenance mode failed:', error);
    },
  });

  return {
    maintenanceStatus: maintenanceQuery.data,
    isLoadingMaintenanceStatus: maintenanceQuery.isLoading,
    maintenanceStatusError: maintenanceQuery.error,
    refetchMaintenanceStatus: maintenanceQuery.refetch,

    setMaintenanceMode: setMaintenanceModeMutation.mutate,
    setMaintenanceModeAsync: setMaintenanceModeMutation.mutateAsync,
    isSettingMaintenanceMode: setMaintenanceModeMutation.isPending,
    setMaintenanceModeError: setMaintenanceModeMutation.error,
  };
}

/**
 * Hook for rate limits
 */
export function useRateLimits() {
  return useQuery({
    queryKey: configKeys.rateLimits(),
    queryFn: ConfigService.getRateLimits,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook for supported locales
 */
export function useSupportedLocales() {
  return useQuery({
    queryKey: configKeys.locales(),
    queryFn: ConfigService.getSupportedLocales,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for user-specific configuration
 */
export function useUserConfig() {
  const queryClient = useQueryClient();

  const userConfigQuery = useQuery({
    queryKey: configKeys.userConfig(),
    queryFn: ConfigService.getUserConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const updateUserConfigMutation = useMutation({
    mutationFn: ConfigService.updateUserConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.userConfig() });
    },
    onError: (error) => {
      console.error('Update user config failed:', error);
    },
  });

  return {
    userConfig: userConfigQuery.data,
    isLoadingUserConfig: userConfigQuery.isLoading,
    userConfigError: userConfigQuery.error,
    refetchUserConfig: userConfigQuery.refetch,

    updateUserConfig: updateUserConfigMutation.mutate,
    updateUserConfigAsync: updateUserConfigMutation.mutateAsync,
    isUpdatingUserConfig: updateUserConfigMutation.isPending,
    updateUserConfigError: updateUserConfigMutation.error,
  };
}

export default useConfig;