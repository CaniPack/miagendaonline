import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener una cita específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    // Verificar que la cita pertenece al usuario actual
    if (appointment.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar una cita
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, date, duration, notes, status } = body;

    // Verificar que la cita existe y pertenece al usuario
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (existingAppointment.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Actualizar la cita
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        customerId,
        date: new Date(date),
        duration,
        notes,
        status,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar una cita
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que la cita existe y pertenece al usuario
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (existingAppointment.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Eliminar la cita
    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 