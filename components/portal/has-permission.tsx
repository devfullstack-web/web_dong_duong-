"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface HasPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A declarative component to conditionally render children based on user permissions.
 */
export function HasPermission({ permission, children, fallback = null }: HasPermissionProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) return null;

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
