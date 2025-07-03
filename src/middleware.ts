import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',
  '/appointments(.*)',
  '/calendario(.*)',
  '/clientes(.*)',
  '/customers(.*)',
  '/ingresos(.*)',
  '/mi-pagina-web(.*)',
  '/api/appointments(.*)',
  '/api/customers(.*)',
  '/api/landing-page(.*)',
  '/api/notifications(.*)',
  '/api/payments(.*)',
  '/api/plans(.*)',
  '/api/upload(.*)',
  '/api/calendar(.*)'
]);

// Define API routes for special handling
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public landing pages and their APIs
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
    } catch (error) {
      // If it's an API route, return JSON error instead of redirect
      if (isApiRoute(req)) {
        return NextResponse.json(
          { error: 'No autorizado', message: 'Debes iniciar sesión para acceder a esta función' },
          { status: 401 }
        );
      }
      // For non-API routes, let Clerk handle the redirect
      throw error;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 