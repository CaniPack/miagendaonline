import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PUT - Actualizar cita específica
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, date, duration, notes, status, internalComment, internalPrice, publicPrice } = body;

    // Verificar que la cita pertenece al usuario
    const existingAppointment = await prisma.appointment.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(customerId && { customerId }),
        ...(date && { date: new Date(date) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(internalComment !== undefined && { internalComment }),
        ...(internalPrice !== undefined && { internalPrice: internalPrice ? parseInt(internalPrice) : null }),
        ...(publicPrice !== undefined && { publicPrice: publicPrice ? parseInt(publicPrice) : null }),
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        user: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar cita específica
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que la cita pertenece al usuario
    const existingAppointment = await prisma.appointment.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 