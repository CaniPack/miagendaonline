import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const { searchParams } = new URL(request.url);
    const onlyUnread = searchParams.get('unread') === 'true';

    const notifications = await prisma.notification.findMany({
      where: { 
        userId: dbUser.id,
        ...(onlyUnread && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limitar a 50 notificaciones más recientes
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { type, message, targetUserId } = body;

    // Validación básica
    if (!type || !message) {
      return NextResponse.json({ error: 'Tipo y mensaje son requeridos' }, { status: 400 });
    }

    if (!['EMAIL', 'WHATSAPP', 'SYSTEM'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de notificación inválido' }, { status: 400 });
    }

    // Si se especifica targetUserId, verificar que el usuario actual tenga permisos
    // Por ahora, solo permitir enviar notificaciones a sí mismo
    const finalTargetUserId = targetUserId || dbUser.id;

    const notification = await prisma.notification.create({
      data: {
        userId: finalTargetUserId,
        type,
        message,
        read: false,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Marcar notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { notificationIds, markAsRead = true } = body;

    // Si no se proporcionan IDs específicos, marcar todas como leídas
    if (!notificationIds || notificationIds.length === 0) {
      await prisma.notification.updateMany({
        where: { 
          userId: dbUser.id,
          read: false,
        },
        data: { read: markAsRead },
      });

      return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' });
    }

    // Marcar notificaciones específicas
    await prisma.notification.updateMany({
      where: { 
        id: { in: notificationIds },
        userId: dbUser.id, // Asegurar que solo se modifiquen las notificaciones del usuario
      },
      data: { read: markAsRead },
    });

    return NextResponse.json({ message: 'Notificaciones actualizadas' });
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 