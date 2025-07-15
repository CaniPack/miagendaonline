import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { googleCalendarService } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';

// POST - Sincronizar todas las citas pendientes con Google Calendar
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    // Verificar que el usuario tenga Google Calendar configurado
    if (!dbUser.googleAccessToken || !dbUser.googleCalendarSync) {
      return NextResponse.json(
        { error: 'Google Calendar no está configurado' },
        { status: 400 }
      );
    }

    // Obtener todas las citas futuras no sincronizadas
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: new Date(), // Solo citas futuras
        },
        syncedToGoogle: false, // Solo las no sincronizadas
      },
      include: {
        customer: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay citas pendientes para sincronizar',
        syncedCount: 0,
      });
    }

    // Configurar el servicio con los tokens del usuario
    googleCalendarService.setCredentials({
      access_token: dbUser.googleAccessToken,
      refresh_token: dbUser.googleRefreshToken || undefined,
    });

    let syncedCount = 0;
    let errors: string[] = [];

    // Sincronizar cada cita
    for (const appointment of appointments) {
      try {
        const endDate = new Date(appointment.date);
        endDate.setMinutes(endDate.getMinutes() + appointment.duration);

        const eventData = {
          summary: `Cita con ${appointment.customer.name}`,
          description: appointment.notes ? 
            `Notas: ${appointment.notes}${appointment.internalComment ? `\n\nComentario interno: ${appointment.internalComment}` : ''}` : 
            (appointment.internalComment || ''),
          startDateTime: appointment.date.toISOString(),
          endDateTime: endDate.toISOString(),
          attendeeEmail: appointment.customer.email || undefined,
          location: dbUser.phone ? `Contacto: ${dbUser.phone}` : undefined,
        };

        const result = await googleCalendarService.createEvent(eventData);

        if (result.success) {
          // Actualizar la cita en la base de datos
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
              googleEventId: result.eventId,
              googleEventLink: result.htmlLink,
              syncedToGoogle: true,
            },
          });
          syncedCount++;
        } else {
          errors.push(`Error en cita con ${appointment.customer.name}: ${result.error}`);
        }

        // Pequeña pausa para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors.push(`Error en cita con ${appointment.customer.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${syncedCount} citas sincronizadas exitosamente`,
      syncedCount,
      totalAppointments: appointments.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return handleApiError(error, 'POST calendar sync-all');
  }
} 