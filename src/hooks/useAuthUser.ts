'use client';

import { useUser } from '@clerk/nextjs';

// Usuario simulado para desarrollo
const mockUser = {
  isSignedIn: true,
  isLoaded: true,
  user: {
    id: 'user_dev_12345',
    firstName: 'Juan',
    lastName: 'Pérez',
    emailAddresses: [{ emailAddress: 'juan.perez@ejemplo.com' }],
  }
};

export function useAuthUser() {
  const isDevelopment = process.env.NODE_ENV === 'development' && 
                       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_your_real_publishable_key_here';
  
  if (isDevelopment) {
    return mockUser;
  }
  
  // En producción, usar el hook real de Clerk
  return useUser();
} 