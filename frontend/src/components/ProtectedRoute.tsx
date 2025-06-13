"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useConfig } from "../hooks/useConfig";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that guards pages based on authentication status
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/auth/login",
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { enableAuth } = useConfig();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  React.useEffect(() => {
    // If auth is disabled, always allow access
    if (!enableAuth) {
      return;
    }

    // If we're still loading, don't redirect yet
    if (isLoading) {
      return;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      setShouldRedirect(true);
      return;
    }

    // If auth is not required but user is authenticated (e.g., login page)
    if (!requireAuth && isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    setShouldRedirect(false);
  }, [enableAuth, isLoading, isAuthenticated, requireAuth, router]);

  React.useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  // If auth is disabled, always render children
  if (!enableAuth) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we should redirect, show fallback or loading
  if (shouldRedirect) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // For protected routes, check if user is authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // For non-protected routes (like login page), check if user is already authenticated
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking if current user has specific permissions
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = React.useCallback(
    (permission: string) => {
      if (!isAuthenticated || !user) {
        return false;
      }

      // Add your permission logic here
      // This is a simple example - you might want to check user roles, permissions array, etc.
      // For now, we'll assume all authenticated users have basic permissions
      const basicPermissions = ["read", "write", "chat"];
      const adminPermissions = [
        "admin",
        "delete",
        "manage_users",
        "manage_config",
      ];

      // Check if user has admin role (you'll need to add this to your user schema)
      const isAdmin = (user as any).role === "admin" || (user as any).isAdmin;

      if (isAdmin) {
        return [...basicPermissions, ...adminPermissions].includes(permission);
      }

      return basicPermissions.includes(permission);
    },
    [isAuthenticated, user]
  );

  const hasAnyPermission = React.useCallback(
    (permissions: string[]) => {
      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  const hasAllPermissions = React.useCallback(
    (permissions: string[]) => {
      return permissions.every((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasPermission("admin"),
  };
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
