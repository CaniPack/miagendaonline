import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener cliente específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          where: { userId: userExists.id }, // Solo citas del usuario actual usando el ID de la BD
          orderBy: { date: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { 
            appointments: {
              where: { userId: userExists.id } // Contar solo las citas del usuario actual
            }
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar cliente específico
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // Verificar que el cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Verificar si ya existe otro cliente con el mismo email
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findFirst({
        where: { 
          email,
          id: { not: params.id },
        },
      });

      if (emailExists) {
        return NextResponse.json({ error: 'Ya existe otro cliente con este email' }, { status: 400 });
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar cliente específico
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Verificar si el cliente tiene citas pendientes
    const pendingAppointments = await prisma.appointment.count({
      where: {
        customerId: params.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
    });

    if (pendingAppointments > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el cliente porque tiene citas pendientes' 
      }, { status: 400 });
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 