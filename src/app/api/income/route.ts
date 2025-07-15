import { NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener datos de ingresos
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calcular fechas del mes actual
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59);

    // Calcular fechas del mes anterior
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
    const endOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0);
    endOfLastMonth.setHours(23, 59, 59);

    // Calcular fechas del año actual
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    endOfYear.setHours(23, 59, 59);

    // Obtener citas completadas del mes actual
    const thisMonthAppointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
    });

    // Obtener citas completadas del mes anterior
    const lastMonthAppointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: 'COMPLETED',
      },
    });

    // Obtener citas completadas del año actual
    const thisYearAppointments = await prisma.appointment.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
        status: 'COMPLETED',
      },
    });

    // Calcular ingresos
    const getAppointmentPrice = (apt: any) => apt.internalPrice || 50000;
    
    const totalThisMonth = thisMonthAppointments.reduce((sum, apt) => 
      sum + getAppointmentPrice(apt), 0);
    
    const totalLastMonth = lastMonthAppointments.reduce((sum, apt) => 
      sum + getAppointmentPrice(apt), 0);
    
    const totalThisYear = thisYearAppointments.reduce((sum, apt) => 
      sum + getAppointmentPrice(apt), 0);

    // Calcular crecimiento vs mes anterior
    const growthPercentage = totalLastMonth > 0 ? 
      ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 
      (totalThisMonth > 0 ? 100 : 0); // Si no hay mes anterior pero sí este mes, es 100% crecimiento

    // Calcular promedio mensual
    const monthsElapsed = currentMonth + 1;
    const averageMonthly = monthsElapsed > 0 ? totalThisYear / monthsElapsed : 0;

    // Obtener citas pendientes y futuras
    const pendingAppointments = await prisma.appointment.count({
      where: {
        userId: dbUser.id,
        status: 'PENDING',
        date: {
          gte: new Date(),
        },
      },
    });

    const futureAppointments = await prisma.appointment.count({
      where: {
        userId: dbUser.id,
        status: 'CONFIRMED',
        date: {
          gte: new Date(),
        },
      },
    });

    const incomeData = {
      totalThisMonth,
      totalLastMonth,
      totalThisYear,
      growth: isNaN(growthPercentage) ? 0 : growthPercentage, // Asegurar que no sea NaN
      monthlyAverage: isNaN(averageMonthly) ? 0 : averageMonthly, // Asegurar que no sea NaN
      completedAppointments: thisMonthAppointments.length,
      pendingAppointments,
      futureAppointments,
    };

    return NextResponse.json(incomeData);
  } catch (error) {
    return handleApiError(error, 'GET income');
  }
} 