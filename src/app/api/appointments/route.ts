import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las citas del usuario actual
export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    // Calcular fechas según el período
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    let dateFilter = {};
    
    if (period === 'today') {
      dateFilter = {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      };
    } else if (period === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59);

      dateFilter = {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      };
    } else if (period === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59);

      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id, // 🔒 CRÍTICO: Solo citas del usuario actual
        ...dateFilter,
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
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return handleApiError(error, 'GET appointments');
  }
}

// POST - Crear nueva cita para el usuario actual
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { customerId, date, duration, notes, internalComment, internalPrice, publicPrice } = body;

    // Validaciones básicas
    if (!customerId || !date || !duration) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar que el cliente existe Y pertenece al usuario actual
    const customer = await prisma.customer.findFirst({
      where: { 
        id: customerId,
        userId: dbUser.id, // 🔒 CRÍTICO: Solo cliente del usuario actual
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Verificar conflictos de horarios con otras citas del usuario actual
    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id, // 🔒 Solo buscar conflictos en citas del usuario actual
        date: {
          gte: appointmentDate,
          lt: appointmentEnd,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json({ 
        error: 'Conflicto de horarios detectado',
        conflicts: conflictingAppointments.map(apt => ({
          id: apt.id,
          date: apt.date,
          duration: apt.duration,
        }))
      }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: dbUser.id, // 🔒 CRÍTICO: Asignar al usuario actual
        customerId,
        date: appointmentDate,
        duration,
        notes,
        internalComment,
        internalPrice,
        publicPrice,
        status: 'PENDING',
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

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST appointments');
  }
} 