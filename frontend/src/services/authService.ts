import { api, tokenManager } from "../lib/api";
import type {
  LoginFormData,
  RegisterFormData,
  Session,
  SessionResponse,
  VerificationResponse,
} from "../lib/zod-schemas";

// Authentication service using axios for server-side calls
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginFormData): Promise<SessionResponse> {
    try {
      const { data } = await api.post<SessionResponse>(
        "auth/login",
        credentials
      );
      // Store the token in localStorage
      if (data.data.token) {
        tokenManager.setToken(data.data.token);
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async register(
    userData: Omit<RegisterFormData, "confirmPassword">
  ): Promise<{ user: Session["user"]; message: string }> {
    try {
      const { data } = await api.post<{
        user: Session["user"];
        message: string;
      }>("auth/register", userData);
      // No longer store token on registration since email verification is required
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  static async getSession(): Promise<Session | null> {
    try {
      const { data } = await api.get<Session>("auth/session");
      return data;
    } catch (error) {
      // Session might not exist or be expired
      console.warn("Session error:", error);
      return null;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await api.post("auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      // Always remove token from localStorage, even if logout request fails
      tokenManager.removeToken();
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(
    email: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        "auth/reset-password",
        { email }
      );
      return data;
    } catch (error) {
      console.error("Password reset request error:", error);
      throw error;
    }
  }

  /**
   * Forgot password - alias for requestPasswordReset
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        "auth/forgot-password",
        { email }
      );
      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        `auth/reset-password/${token}`,
        {
          token,
          password: newPassword,
        }
      );
      return data;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        "auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );
      return data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<Session> {
    try {
      const { data } = await api.post<Session>("auth/refresh");
      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  // Verify email implementation moved to line ~190

  // Resend verification implementation moved to line ~220

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<VerificationResponse> {
    try {
      const { data } = await api.get<VerificationResponse>(
        `auth/verify-email/${token}`
      );
      return data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        "auth/resend-verification",
        { email }
      );
      return data;
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  }
}

export default AuthService;
