import { NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener estadísticas del dashboard
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Citas de hoy
    const appointmentsToday = await prisma.appointment.count({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // Total de clientes
    const totalClients = await prisma.customer.count({
      where: {
        userId: dbUser.id,
      },
    });

    // Citas completadas este mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59);

    const completedThisMonth = await prisma.appointment.count({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
    });

    // Ingresos de este mes
    const monthlyRevenue = await prisma.appointment.aggregate({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
      _sum: {
        internalPrice: true,
      },
    });

    const stats = {
      appointmentsToday,
      totalClients,
      completedThisMonth,
      monthlyRevenue: monthlyRevenue._sum.internalPrice || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, 'Error al obtener estadísticas');
  }
} 