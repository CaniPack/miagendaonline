import { auth } from '@clerk/nextjs/server';

// Usuario simulado para desarrollo
const mockUser = {
  userId: 'user_dev_12345',
  user: {
    id: 'user_dev_12345',
    firstName: 'Juan',
    lastName: 'Pérez',
    emailAddresses: [{ emailAddress: 'juan.perez@ejemplo.com' }]
  }
};

export async function getAuthUser() {
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  if (isDevelopment) {
    return mockUser;
  } else {
    return await auth();
  }
} 