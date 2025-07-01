import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las citas del usuario
export async function GET() {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        customer: true,
        user: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, date, duration, notes } = body;

    // Validación básica
    if (!customerId || !date || !duration) {
      return NextResponse.json({ error: 'Campos requeridos: customerId, date, duration' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        customerId,
        date: new Date(date),
        duration: parseInt(duration),
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        customer: true,
        user: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error al crear cita:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 