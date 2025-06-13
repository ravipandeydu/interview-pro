import { api } from '../lib/api';

// Configuration interfaces
interface AppConfig {
  features: {
    chat: boolean;
    auth: boolean;
    analytics: boolean;
    notifications: boolean;
    darkMode: boolean;
    multiLanguage: boolean;
  };
  limits: {
    maxChatMessages: number;
    maxFileSize: number;
    maxUsers: number;
    rateLimitPerMinute: number;
  };
  ui: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  };
  integrations: {
    analytics: {
      enabled: boolean;
      provider: string;
      trackingId?: string;
    };
    email: {
      enabled: boolean;
      provider: string;
      fromAddress?: string;
    };
    storage: {
      provider: string;
      bucket?: string;
      region?: string;
    };
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    estimatedDuration?: string;
  };
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Config service using axios for server-side calls
export class ConfigService {
  /**
   * Get application configuration
   */
  static async getAppConfig(): Promise<AppConfig> {
    try {
      const { data } = await api.get<AppConfig>('/api/config');
      return data;
    } catch (error) {
      console.error('Get app config error:', error);
      throw error;
    }
  }

  /**
   * Update application configuration (admin only)
   */
  static async updateAppConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    try {
      const { data } = await api.put<AppConfig>('/api/config', config);
      return data;
    } catch (error) {
      console.error('Update app config error:', error);
      throw error;
    }
  }

  /**
   * Get feature flags
   */
  static async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const { data } = await api.get<FeatureFlag[]>('/api/config/features');
      return data;
    } catch (error) {
      console.error('Get feature flags error:', error);
      throw error;
    }
  }

  /**
   * Check if a specific feature is enabled
   */
  static async isFeatureEnabled(featureId: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ enabled: boolean }>(`/api/config/features/${featureId}`);
      return data.enabled;
    } catch (error) {
      console.error('Check feature enabled error:', error);
      return false; // Default to disabled on error
    }
  }

  /**
   * Toggle feature flag (admin only)
   */
  static async toggleFeatureFlag(featureId: string, enabled: boolean): Promise<FeatureFlag> {
    try {
      const { data } = await api.patch<FeatureFlag>(`/api/config/features/${featureId}`, { enabled });
      return data;
    } catch (error) {
      console.error('Toggle feature flag error:', error);
      throw error;
    }
  }

  /**
   * Create new feature flag (admin only)
   */
  static async createFeatureFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    try {
      const { data } = await api.post<FeatureFlag>('/api/config/features', flag);
      return data;
    } catch (error) {
      console.error('Create feature flag error:', error);
      throw error;
    }
  }

  /**
   * Delete feature flag (admin only)
   */
  static async deleteFeatureFlag(featureId: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete<{ message: string }>(`/api/config/features/${featureId}`);
      return data;
    } catch (error) {
      console.error('Delete feature flag error:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Array<{
      name: string;
      status: 'up' | 'down';
      responseTime?: number;
      lastCheck: string;
    }>;
    uptime: number;
    version: string;
  }> {
    try {
      const { data } = await api.get('/api/config/health');
      return data;
    } catch (error) {
      console.error('Get system health error:', error);
      throw error;
    }
  }

  /**
   * Get API version and build info
   */
  static async getVersionInfo(): Promise<{
    version: string;
    buildDate: string;
    gitCommit: string;
    environment: string;
  }> {
    try {
      const { data } = await api.get('/api/config/version');
      return data;
    } catch (error) {
      console.error('Get version info error:', error);
      throw error;
    }
  }

  /**
   * Get maintenance status
   */
  static async getMaintenanceStatus(): Promise<{
    enabled: boolean;
    message?: string;
    estimatedDuration?: string;
    startTime?: string;
    endTime?: string;
  }> {
    try {
      const { data } = await api.get('/api/config/maintenance');
      return data;
    } catch (error) {
      console.error('Get maintenance status error:', error);
      throw error;
    }
  }

  /**
   * Set maintenance mode (admin only)
   */
  static async setMaintenanceMode(maintenance: {
    enabled: boolean;
    message?: string;
    estimatedDuration?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>('/api/config/maintenance', maintenance);
      return data;
    } catch (error) {
      console.error('Set maintenance mode error:', error);
      throw error;
    }
  }

  /**
   * Get rate limits for current user
   */
  static async getRateLimits(): Promise<{
    limits: Record<string, {
      limit: number;
      remaining: number;
      resetTime: string;
    }>;
  }> {
    try {
      const { data } = await api.get('/api/config/rate-limits');
      return data;
    } catch (error) {
      console.error('Get rate limits error:', error);
      throw error;
    }
  }

  /**
   * Get supported locales
   */
  static async getSupportedLocales(): Promise<Array<{
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    enabled: boolean;
  }>> {
    try {
      const { data } = await api.get('/api/config/locales');
      return data;
    } catch (error) {
      console.error('Get supported locales error:', error);
      throw error;
    }
  }

  /**
   * Get user-specific configuration
   */
  static async getUserConfig(): Promise<{
    theme: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showActivity: boolean;
      allowMessages: boolean;
    };
  }> {
    try {
      const { data } = await api.get('/api/config/user');
      return data;
    } catch (error) {
      console.error('Get user config error:', error);
      throw error;
    }
  }

  /**
   * Update user-specific configuration
   */
  static async updateUserConfig(config: Partial<{
    theme: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showActivity: boolean;
      allowMessages: boolean;
    };
  }>): Promise<{ message: string }> {
    try {
      const { data } = await api.put<{ message: string }>('/api/config/user', config);
      return data;
    } catch (error) {
      console.error('Update user config error:', error);
      throw error;
    }
  }
}

export default ConfigService;
export type { AppConfig, FeatureFlag };