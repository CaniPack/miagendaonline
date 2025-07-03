import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Crear cita desde landing page pública
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      professionalClerkId, 
      formData, 
      selectedDate, 
      selectedTime, 
      selectedService 
    } = body;

    // Validaciones básicas
    if (!professionalClerkId || !formData || !selectedDate || !selectedTime) {
      return NextResponse.json({ 
        error: 'Faltan datos requeridos' 
      }, { status: 400 });
    }

    // Verificar que el profesional existe
    const professional = await prisma.user.findUnique({
      where: { clerkId: professionalClerkId },
      include: {
        landingPage: true,
      },
    });

    if (!professional) {
      return NextResponse.json({ 
        error: 'Profesional no encontrado' 
      }, { status: 404 });
    }

    // Extraer datos del formulario
    const { name, lastName, email, phone, comment } = formData;

    if (!name || !email) {
      return NextResponse.json({ 
        error: 'Nombre y email son requeridos' 
      }, { status: 400 });
    }

    // Crear combinación de fecha y hora
    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);

    // Determinar duración de la cita
    let duration = professional.landingPage?.appointmentDuration || 60; // Default 60 minutos
    
    // Si hay un servicio seleccionado con duración específica, usar esa
    if (selectedService && selectedService.duration) {
      duration = selectedService.duration;
    }

    // Verificar conflictos de horarios
    const appointmentEnd = new Date(appointmentDateTime);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        userId: professional.id,
        date: {
          gte: appointmentDateTime,
          lt: appointmentEnd,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json({ 
        error: 'Horario no disponible',
        message: 'El horario seleccionado ya está ocupado'
      }, { status: 409 });
    }

    // Buscar o crear customer
    let customer = await prisma.customer.findFirst({
      where: { 
        userId: professional.id, // 🔒 CRÍTICO: Buscar solo en clientes del profesional
        email: email.toLowerCase() 
      },
    });

    if (!customer) {
      // Crear nuevo customer asociado al profesional
      customer = await prisma.customer.create({
        data: {
          userId: professional.id, // 🔒 CRÍTICO: Asociar al profesional
          name: `${name} ${lastName || ''}`.trim(),
          email: email.toLowerCase(),
          phone: phone || null,
        },
      });
    }

    // Crear la cita
    const appointment = await prisma.appointment.create({
      data: {
        userId: professional.id, // 🔒 CRÍTICO: Asociar al profesional
        customerId: customer.id,
        date: appointmentDateTime,
        duration,
        status: 'PENDING',
        notes: comment || null,
        // Si hay servicio seleccionado, agregar info
        internalComment: selectedService ? 
          `Servicio: ${selectedService.name} - ${selectedService.description}` : 
          'Cita agendada desde landing page',
        publicPrice: selectedService?.price ? 
          parseInt(selectedService.price.replace(/[^\d]/g, '')) : 
          null,
      },
      include: {
        customer: true,
      },
    });

    // Crear notificación para el profesional
    await prisma.notification.create({
      data: {
        userId: professional.id,
        type: 'SYSTEM',
        message: `Nueva cita agendada: ${customer.name} para el ${appointmentDateTime.toLocaleDateString()} a las ${appointmentDateTime.toLocaleTimeString()}`,
        read: false,
      },
    });

    return NextResponse.json({ 
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        customer: {
          name: customer.name,
          email: customer.email,
        },
        professional: {
          name: professional.name,
          email: professional.email,
        },
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear cita pública:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 