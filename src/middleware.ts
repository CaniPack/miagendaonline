import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // En modo desarrollo, simplemente pasar todas las requests
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  if (isDevelopment) {
    return NextResponse.next();
  }
  
  // En producción, también pasar por ahora - Clerk se maneja en el client side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 