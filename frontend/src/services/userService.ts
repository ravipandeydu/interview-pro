import { api } from "../lib/api";
import type {
  User,
  UserProfileFormData,
  UserResponse,
} from "../lib/zod-schemas";

// User service using axios for server-side calls
export class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<User> {
    try {
      const { data } = await api.get<User>(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error("Get user profile error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUserProfile(): Promise<User> {
    try {
      const { data } = await api.get<UserResponse>("/api/users/me");
      return data?.data;
    } catch (error) {
      console.error("Get current user profile error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    profileData: UserProfileFormData
  ): Promise<User> {
    try {
      const { data } = await api.put<User>("/users/me", profileData);
      return data;
    } catch (error) {
      console.error("Update user profile error:", error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post<{ avatarUrl: string }>(
        "/api/users/me/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  }

  /**
   * Delete user avatar
   */
  static async deleteAvatar(): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>(
        "/users/me/avatar"
      );
      return data;
    } catch (error) {
      console.error("Delete avatar error:", error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const { data } = await api.get<Record<string, any>>(
        "/users/me/preferences"
      );
      return data;
    } catch (error) {
      console.error("Get user preferences error:", error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    preferences: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const { data } = await api.put<Record<string, any>>(
        "/users/me/preferences",
        preferences
      );
      return data;
    } catch (error) {
      console.error("Update user preferences error:", error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(
    page = 1,
    limit = 20
  ): Promise<{
    activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get("/users/me/activity", {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error("Get user activity error:", error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(password: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>("/users/me", {
        data: { password },
      });
      return data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  }

  /**
   * Search users (admin or public search)
   */
  static async searchUsers(
    query: string,
    page = 1,
    limit = 20
  ): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get("/users/search", {
        params: { q: query, page, limit },
      });
      return data;
    } catch (error) {
      console.error("Search users error:", error);
      throw error;
    }
  }

  /**
   * Follow/unfollow user
   */
  static async toggleFollow(
    userId: string
  ): Promise<{ following: boolean; message: string }> {
    try {
      const { data } = await api.post<{ following: boolean; message: string }>(
        `/users/${userId}/follow`
      );
      return data;
    } catch (error) {
      console.error("Toggle follow error:", error);
      throw error;
    }
  }

  /**
   * Get user followers
   */
  static async getUserFollowers(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{
    followers: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get(`/users/${userId}/followers`, {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error("Get user followers error:", error);
      throw error;
    }
  }

  /**
   * Get user following
   */
  static async getUserFollowing(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{
    following: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data } = await api.get(`/users/${userId}/following`, {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      console.error("Get user following error:", error);
      throw error;
    }
  }
}

export default UserService;
