import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las citas del usuario
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar el usuario en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!userExists) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // today, week, month
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges based on period or custom dates
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      // Custom date range
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lt: new Date(endDate)
        }
      };
    } else if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      dateFilter = {
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      dateFilter = {
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      dateFilter = {
        date: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: { 
        userId: userExists.id, // Usar el ID de la base de datos
        ...dateFilter
      },
      include: {
        customer: true,
        user: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ appointments });
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

    // Verificar que el usuario existe en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!userExists) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }

    // Verificar que el customer existe
    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customerExists) {
      return NextResponse.json({ error: 'Cliente no encontrado. Por favor selecciona un cliente válido.' }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: userExists.id, // Usar el ID de la base de datos, no el clerkId
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
  } catch (error: any) {
    console.error('Error al crear cita:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Error de integridad de datos: el cliente o usuario especificado no existe' 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 