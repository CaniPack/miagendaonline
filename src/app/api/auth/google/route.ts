import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { googleCalendarService } from '@/lib/google-calendar';

// GET - Obtener URL de autorización de Google
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    // Generar URL de autorización
    const authUrl = googleCalendarService.generateAuthUrl();

    return NextResponse.json({ 
      authUrl,
      message: 'Redirige al usuario a esta URL para autorizar acceso a Google Calendar'
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      { error: 'Error al generar URL de autorización' },
      { status: 500 }
    );
  }
}

// POST - Verificar estado de conexión con Google
export async function POST() {
  try {
    const { dbUser } = await getOrCreateUser();

    const isConnected = !!(dbUser.googleAccessToken && dbUser.googleCalendarSync);
    
    return NextResponse.json({ 
      connected: isConnected,
      syncEnabled: dbUser.googleCalendarSync || false,
    });
  } catch (error) {
    console.error('Error checking Google connection:', error);
    return NextResponse.json(
      { error: 'Error al verificar conexión con Google' },
      { status: 500 }
    );
  }
} 