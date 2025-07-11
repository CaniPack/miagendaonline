import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface Service {
  id: string;
  duration?: number;
  bufferTime?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const serviceId = searchParams.get('serviceId'); // Para usar configuración específica de servicio
    const date = searchParams.get('date'); // YYYY-MM-DD format

    if (!professionalId) {
      return NextResponse.json({ error: 'ID del profesional requerido' }, { status: 400 });
    }

    // Verificar si el profesional existe y obtener su configuración
    const professional = await prisma.user.findUnique({
      where: { clerkId: professionalId },
      include: {
        landingPage: true
      }
    });

    if (!professional) {
      return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
    }

    if (!professional.landingPage) {
      return NextResponse.json({ error: 'Landing page no configurada' }, { status: 404 });
    }

    // Obtener configuración del servicio específico si se proporciona
    let serviceDuration: number | null = null;
    let serviceBufferTime: number | null = null;
    
    if (serviceId) {
      try {
        const services: Service[] = JSON.parse(professional.landingPage.services || '[]');
        const service = services.find((s: Service) => s.id === serviceId);
        if (service) {
          serviceDuration = service.duration || null;
          serviceBufferTime = service.bufferTime || null;
        }
      } catch (e) {
        console.error('Error parsing services:', e);
      }
    }

    // Usar configuración del servicio o la general
    const appointmentDuration = serviceDuration || professional.landingPage.appointmentDuration || 60;
    const bufferTime = serviceBufferTime || professional.landingPage.bufferTime || 0;
    const totalSlotTime = appointmentDuration + bufferTime; // Tiempo total que ocupa cada cita

    console.log('📅 Configuración de slots:', {
      appointmentDuration,
      bufferTime,
      totalSlotTime,
      serviceId,
      usingServiceConfig: serviceDuration !== null || serviceBufferTime !== null
    });

    // Configurar rango de fechas
    const whereCondition: Prisma.AppointmentWhereInput = {
      userId: professional.id,
      status: { not: 'CANCELLED' } // Excluir citas canceladas
    };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereCondition.date = { gte: startOfDay, lte: endOfDay };
    } else {
      // Si no se especifica fecha, obtener citas de los próximos 30 días
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      whereCondition.date = { gte: today, lte: thirtyDaysFromNow };
    }

    // Obtener citas existentes
    const existingAppointments = await prisma.appointment.findMany({
      where: whereCondition,
      select: {
        date: true,
        duration: true,
        status: true
      },
      orderBy: { date: 'asc' }
    });

    console.log('📋 Citas existentes encontradas:', existingAppointments.length);

    // Generar slots disponibles
    const generateAvailableSlots = (targetDate: string) => {
      const availableSlots = [];
      const dateObj = new Date(`${targetDate}T00:00:00`);
      
      // Horarios de trabajo configurables (por ahora 9:00 a 18:00)
      // TODO: Hacer esto configurable desde la landing page
      const workStartHour = 9;
      const workEndHour = 18;
      
      // Generar slots cada 30 minutos como mínimo, pero respetando la duración de cita
      const slotInterval = Math.min(30, appointmentDuration); // Intervalos de 30 min o la duración de la cita
      const totalMinutesWork = (workEndHour - workStartHour) * 60;
      const numberOfSlots = Math.floor(totalMinutesWork / slotInterval);

      for (let i = 0; i < numberOfSlots; i++) {
        const slotStartMinutes = workStartHour * 60 + i * slotInterval;
        const slotHour = Math.floor(slotStartMinutes / 60);
        const slotMinute = slotStartMinutes % 60;

        // Verificar que el slot completo (cita + tiempo intermedio) quepa en el horario de trabajo
        const slotEndMinutes = slotStartMinutes + totalSlotTime;
        const maxWorkMinutes = workEndHour * 60;
        
        if (slotEndMinutes > maxWorkMinutes) {
          continue; // No cabe en el horario de trabajo
        }

        const slotTime = new Date(dateObj);
        slotTime.setHours(slotHour, slotMinute, 0, 0);
        
        // Verificar si este slot está ocupado
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.date);
          const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
          const slotEnd = new Date(slotTime.getTime() + totalSlotTime * 60000);
          
          // Verificar solapamiento: el slot está ocupado si hay cualquier solapamiento
          return (
            (slotTime.getTime() >= appointmentStart.getTime() && slotTime.getTime() < appointmentEnd.getTime()) ||
            (slotEnd.getTime() > appointmentStart.getTime() && slotEnd.getTime() <= appointmentEnd.getTime()) ||
            (slotTime.getTime() <= appointmentStart.getTime() && slotEnd.getTime() >= appointmentEnd.getTime())
          );
        });

        if (!isOccupied) {
          availableSlots.push({
            datetime: slotTime.toISOString(),
            time: `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`,
            available: true,
            duration: appointmentDuration,
            bufferTime: bufferTime
          });
        }
      }
      
      return availableSlots;
    };

    if (date) {
      // Retornar slots para fecha específica
      const slots = generateAvailableSlots(date);
      console.log(`📅 Slots generados para ${date}:`, slots.length);
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
      
      console.log('📅 Días generados:', next7Days.map(d => `${d.date}: ${d.slots.length} slots`));
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