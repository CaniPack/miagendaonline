import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { googleCalendarService } from '@/lib/google-calendar';
import { prisma } from '@/lib/prisma';

// POST - Sincronizar una cita específica con Google Calendar
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga Google Calendar configurado
    if (!dbUser.googleAccessToken || !dbUser.googleCalendarSync) {
      return NextResponse.json(
        { error: 'Google Calendar no está configurado' },
        { status: 400 }
      );
    }

    // Obtener la cita con información del cliente
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: dbUser.id,
      },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Configurar el servicio con los tokens del usuario
    googleCalendarService.setCredentials({
      access_token: dbUser.googleAccessToken,
      refresh_token: dbUser.googleRefreshToken || undefined,
    });

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

    let result;
    
    if (appointment.googleEventId && appointment.syncedToGoogle) {
      // Actualizar evento existente
      result = await googleCalendarService.updateEvent(appointment.googleEventId, eventData);
    } else {
      // Crear nuevo evento
      result = await googleCalendarService.createEvent(eventData);
    }

    if (result.success) {
      // Actualizar la cita en la base de datos
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          googleEventId: result.eventId || appointment.googleEventId,
          googleEventLink: result.htmlLink || appointment.googleEventLink,
          syncedToGoogle: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Cita sincronizada con Google Calendar',
        eventLink: result.htmlLink,
      });
    } else {
      return NextResponse.json(
        { error: `Error al sincronizar: ${result.error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'POST calendar sync');
  }
}

// DELETE - Eliminar cita de Google Calendar
export async function DELETE(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga Google Calendar configurado
    if (!dbUser.googleAccessToken || !dbUser.googleCalendarSync) {
      return NextResponse.json(
        { error: 'Google Calendar no está configurado' },
        { status: 400 }
      );
    }

    // Obtener la cita
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: dbUser.id,
      },
    });

    if (!appointment || !appointment.googleEventId) {
      return NextResponse.json(
        { error: 'Cita no encontrada o no sincronizada' },
        { status: 404 }
      );
    }

    // Configurar el servicio con los tokens del usuario
    googleCalendarService.setCredentials({
      access_token: dbUser.googleAccessToken,
      refresh_token: dbUser.googleRefreshToken || undefined,
    });

    // Eliminar evento de Google Calendar
    const result = await googleCalendarService.deleteEvent(appointment.googleEventId);

    if (result.success) {
      // Actualizar la cita en la base de datos
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          googleEventId: null,
          googleEventLink: null,
          syncedToGoogle: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Cita eliminada de Google Calendar',
      });
    } else {
      return NextResponse.json(
        { error: `Error al eliminar: ${result.error}` },
        { status: 500 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'DELETE calendar sync');
  }
} 