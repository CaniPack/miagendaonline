import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const onlyUnread = searchParams.get('unread') === 'true';

    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
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
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, message, targetUserId } = body;

    // Validación básica
    if (!type || !message) {
      return NextResponse.json({ error: 'Tipo y mensaje son requeridos' }, { status: 400 });
    }

    if (!['EMAIL', 'WHATSAPP', 'SYSTEM'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de notificación inválido' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId || userId, // Permitir notificar a otros usuarios
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
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar notificaciones específicas como leídas
      await prisma.notification.updateMany({
        where: { 
          id: { in: notificationIds },
          userId, // Asegurar que solo se actualicen notificaciones del usuario
        },
        data: { read: true },
      });

      return NextResponse.json({ message: 'Notificaciones marcadas como leídas' });
    } else {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 