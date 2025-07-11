import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener una cita específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
    if (appointment.userId !== dbUser.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar una cita específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { date, duration, status, notes, internalComment, internalPrice, publicPrice } = body;

    // Verificar que la cita existe y pertenece al usuario
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (existingAppointment.userId !== dbUser.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(duration && { duration }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(internalComment !== undefined && { internalComment }),
        ...(internalPrice !== undefined && { internalPrice }),
        ...(publicPrice !== undefined && { publicPrice }),
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

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar una cita específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    // Verificar que la cita existe y pertenece al usuario
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (existingAppointment.userId !== dbUser.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 