import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  // En modo desarrollo, permitir acceso sin autenticación
  if (isDevelopment) {
    return NextResponse.next();
  }
  
  // En modo producción, redirigir a configuración
  return NextResponse.redirect(new URL('/setup-clerk', req.url));
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 