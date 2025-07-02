import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const date = searchParams.get('date'); // YYYY-MM-DD format

    if (!professionalId) {
      return NextResponse.json({ error: 'ID del profesional requerido' }, { status: 400 });
    }

    // Verificar si el profesional existe
    const professional = await prisma.user.findUnique({
      where: { clerkId: professionalId }
    });

    if (!professional) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }

    // Si se especifica una fecha, obtener citas de ese día
    let whereCondition: any = {
      userId: professional.id
    };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      
      whereCondition.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else {
      // Si no se especifica fecha, obtener citas de los próximos 30 días
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      whereCondition.date = {
        gte: today,
        lte: thirtyDaysFromNow
      };
    }

    // Obtener citas existentes
    const existingAppointments = await prisma.appointment.findMany({
      where: whereCondition,
      select: {
        date: true,
        duration: true,
        status: true
      }
    });

    // Generar slots disponibles (horario ejemplo: 9:00 a 18:00, slots de 1 hora)
    const generateAvailableSlots = (targetDate: string) => {
      const availableSlots = [];
      const dateObj = new Date(`${targetDate}T00:00:00`);
      
      // Horarios de trabajo: 9:00 a 18:00
      for (let hour = 9; hour < 18; hour++) {
        const slotTime = new Date(dateObj);
        slotTime.setHours(hour, 0, 0, 0);
        
        // Verificar si este slot está ocupado
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentDate = new Date(appointment.date);
          const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000);
          
          return appointment.status !== 'CANCELLED' && 
                 slotTime.getTime() >= appointmentDate.getTime() && 
                 slotTime.getTime() < appointmentEnd.getTime();
        });

        if (!isOccupied) {
          availableSlots.push({
            datetime: slotTime.toISOString(),
            time: `${hour.toString().padStart(2, '0')}:00`,
            available: true
          });
        }
      }
      
      return availableSlots;
    };

    if (date) {
      // Retornar slots para fecha específica
      const slots = generateAvailableSlots(date);
      return NextResponse.json({ date, slots });
    } else {
      // Retornar slots para los próximos 7 días
      const next7Days = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const slots = generateAvailableSlots(dateString);
        next7Days.push({
          date: dateString,
          dayName: currentDate.toLocaleDateString('es-ES', { weekday: 'long' }),
          slots: slots
        });
      }
      
      return NextResponse.json({ availableDays: next7Days });
    }

  } catch (error) {
    console.error('Error al obtener slots disponibles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 