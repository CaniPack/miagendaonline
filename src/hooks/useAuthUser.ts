'use client';

import { useUser } from '@clerk/nextjs';

/**
 * Custom hook to get authenticated user information
 * This is a wrapper around Clerk's useUser hook for consistency
 */
export function useAuthUser() {
  return useUser();
} 