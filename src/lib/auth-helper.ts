import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

/**
 * Get authenticated user information from Clerk
 * Returns userId and user object if authenticated, null if not
 */
export async function getAuthUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { userId: null, user: null };
    }

    const user = await currentUser();
    
    return {
      userId,
      user: {
        id: userId,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        emailAddresses: user?.emailAddresses || []
      }
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return { userId: null, user: null };
  }
}

/**
 * Get or create user in database
 * This ensures the Clerk user exists in our local database
 */
export async function getOrCreateUser() {
  try {
    const { userId, user } = await getAuthUser();
    
    if (!userId || !user) {
      throw new Error('User not authenticated');
    }

    // Try to find existing user
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // Create user if doesn't exist
    if (!dbUser) {
      const primaryEmail = user.emailAddresses[0]?.emailAddress;
      
      if (!primaryEmail) {
        throw new Error('User email not found');
      }

      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.lastName || 'Usuario',
          role: 'CLIENT' // Default role, can be changed later
        }
      });
    }

    return { userId, user, dbUser };
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}

/**
 * Helper function to handle errors in API routes
 * Returns appropriate response for authentication vs server errors
 */
export function handleApiError(error: unknown, context: string = 'API') {
  console.error(`Error in ${context}:`, error);
  
  // Check if it's an authentication error
  if (error instanceof Error && 
      (error.message === 'User not authenticated' || 
       error.message === 'Authentication required')) {
    return NextResponse.json(
      { error: 'No autorizado', message: 'Debes iniciar sesión para acceder a esta función' },
      { status: 401 }
    );
  }
  
  // Generic server error
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}

 