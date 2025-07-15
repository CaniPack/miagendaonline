import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { googleCalendarService } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';

// GET - Manejar callback de Google OAuth
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // El usuario rechazó la autorización
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/configuracion?google_error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/configuracion?google_error=no_code`
      );
    }

    const { dbUser } = await getOrCreateUser();

    // Intercambiar código por tokens
    const tokenResult = await googleCalendarService.getTokens(code);

    if (!tokenResult.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/configuracion?google_error=${encodeURIComponent(tokenResult.error || 'token_error')}`
      );
    }

    // Guardar tokens en la base de datos
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        googleAccessToken: tokenResult.tokens.access_token,
        googleRefreshToken: tokenResult.tokens.refresh_token,
        googleCalendarSync: true,
      },
    });

    // Redirigir de vuelta a configuración con éxito
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/configuracion?google_success=true`
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/configuracion?google_error=callback_error`
    );
  }
} 