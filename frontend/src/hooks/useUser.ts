'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/userService';
import type { UserProfileFormData } from '../lib/zod-schemas';

// Query keys for React Query
export const userKeys = {
  all: ['user'] as const,
  profile: (userId?: string) => [...userKeys.all, 'profile', userId] as const,
  currentProfile: () => [...userKeys.all, 'profile', 'current'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
  activity: (page?: number) => [...userKeys.all, 'activity', page] as const,
  search: (query: string, page?: number) => [...userKeys.all, 'search', query, page] as const,
  followers: (userId: string, page?: number) => [...userKeys.all, 'followers', userId, page] as const,
  following: (userId: string, page?: number) => [...userKeys.all, 'following', userId, page] as const,
};

/**
 * Custom hook for user operations using React Query
 */
export function useUser() {
  const queryClient = useQueryClient();

  // Get current user profile
  const currentProfileQuery = useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: UserService.getCurrentUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: UserService.updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update the current profile cache
      queryClient.setQueryData(userKeys.currentProfile(), updatedUser);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Update profile failed:', error);
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: UserService.uploadAvatar,
    onSuccess: (result) => {
      // Update the current profile with new avatar URL
      queryClient.setQueryData(userKeys.currentProfile(), (oldData: any) => {
        if (oldData) {
          return { ...oldData, avatar: result.avatarUrl };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Upload avatar failed:', error);
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: UserService.deleteAvatar,
    onSuccess: () => {
      // Remove avatar from current profile
      queryClient.setQueryData(userKeys.currentProfile(), (oldData: any) => {
        if (oldData) {
          return { ...oldData, avatar: undefined };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Delete avatar failed:', error);
    },
  });

  return {
    // Current user profile
    currentProfile: currentProfileQuery.data,
    isLoadingProfile: currentProfileQuery.isLoading,
    profileError: currentProfileQuery.error,
    refetchProfile: currentProfileQuery.refetch,

    // Update profile
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    // Avatar operations
    uploadAvatar: uploadAvatarMutation.mutate,
    uploadAvatarAsync: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,

    deleteAvatar: deleteAvatarMutation.mutate,
    deleteAvatarAsync: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    deleteAvatarError: deleteAvatarMutation.error,
  };
}

/**
 * Hook for getting a specific user profile
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => UserService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for user preferences
 */
export function useUserPreferences() {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: userKeys.preferences(),
    queryFn: UserService.getUserPreferences,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: UserService.updateUserPreferences,
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(userKeys.preferences(), updatedPreferences);
    },
    onError: (error) => {
      console.error('Update preferences failed:', error);
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,
    preferencesError: preferencesQuery.error,
    refetchPreferences: preferencesQuery.refetch,

    updatePreferences: updatePreferencesMutation.mutate,
    updatePreferencesAsync: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    updatePreferencesError: updatePreferencesMutation.error,
  };
}

/**
 * Hook for user activity
 */
export function useUserActivity(page = 1, limit = 20) {
  return useQuery({
    queryKey: userKeys.activity(page),
    queryFn: () => UserService.getUserActivity(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for searching users
 */
export function useUserSearch(query: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: userKeys.search(query, page),
    queryFn: () => UserService.searchUsers(query, page, limit),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting all users
 */
export function useAllUsers(limit = 100) {
  return useQuery({
    queryKey: [...userKeys.all, 'all'],
    queryFn: () => UserService.searchUsers(' ', 1, limit), // Using a space to get all users
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for user follow operations
 */
export function useUserFollow() {
  const queryClient = useQueryClient();

  const toggleFollowMutation = useMutation({
    mutationFn: UserService.toggleFollow,
    onSuccess: (result, userId) => {
      // Invalidate followers/following lists
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId) });
      // Invalidate user profile to update follow status
      queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
    },
    onError: (error) => {
      console.error('Toggle follow failed:', error);
    },
  });

  return {
    toggleFollow: toggleFollowMutation.mutate,
    toggleFollowAsync: toggleFollowMutation.mutateAsync,
    isTogglingFollow: toggleFollowMutation.isPending,
    toggleFollowError: toggleFollowMutation.error,
  };
}

/**
 * Hook for user followers
 */
export function useUserFollowers(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: userKeys.followers(userId, page),
    queryFn: () => UserService.getUserFollowers(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for user following
 */
export function useUserFollowing(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: userKeys.following(userId, page),
    queryFn: () => UserService.getUserFollowing(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for account deletion
 */
export function useAccountDeletion() {
  const queryClient = useQueryClient();

  const deleteAccountMutation = useMutation({
    mutationFn: UserService.deleteAccount,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to login or home page would be handled by the component
    },
    onError: (error) => {
      console.error('Delete account failed:', error);
    },
  });

  return {
    deleteAccount: deleteAccountMutation.mutate,
    deleteAccountAsync: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
    deleteAccountError: deleteAccountMutation.error,
  };
}

export default useUser;