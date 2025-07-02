import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

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
    // En modo desarrollo, crear/buscar usuario de desarrollo en la base de datos
    console.log('🔧 Modo desarrollo - Buscando/creando usuario de desarrollo');
    
    try {
      // Buscar si ya existe el usuario de desarrollo
      let devUser = await prisma.user.findUnique({
        where: { clerkId: 'dev-user-id' }
      });
      
      // Si no existe, crearlo
      if (!devUser) {
        console.log('👤 Creando usuario de desarrollo en la base de datos');
        devUser = await prisma.user.create({
          data: {
            clerkId: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Usuario Desarrollo',
            role: 'CLIENT'
          }
        });
        console.log('✅ Usuario de desarrollo creado:', devUser.id);
      } else {
        console.log('✅ Usuario de desarrollo encontrado:', devUser.id);
      }
      
      return {
        userId: devUser.clerkId,
        user: {
          id: devUser.clerkId,
          firstName: 'Usuario',
          lastName: 'Desarrollo',
          emailAddresses: [{ emailAddress: devUser.email }]
        }
      };
    } catch (error) {
      console.error('Error al manejar usuario de desarrollo:', error);
      // Fallback si hay problemas con la base de datos
      return {
        userId: 'dev-user-id',
        user: {
          id: 'dev-user-id',
          firstName: 'Usuario',
          lastName: 'Desarrollo',
          emailAddresses: [{ emailAddress: 'dev@example.com' }]
        }
      };
    }
  }
  
  // En modo producción, usar Clerk normalmente
  try {
    return await auth();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return { userId: null, user: null };
  }
}

export function getCurrentUser(): string {
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  if (isDevelopment) {
    return 'user_dev_12345';
  } else {
    // En producción, esto necesitaría llamar a auth() y extraer el userId
    throw new Error('getCurrentUser en producción requiere implementación async');
  }
} 