import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener cliente específico del usuario actual
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        userId: dbUser.id, // 🔒 CRÍTICO: Solo cliente del usuario actual
      },
      include: {
        appointments: {
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
            appointments: true, // Ya están filtradas por la relación
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

// PUT - Actualizar cliente específico del usuario actual
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { name, email, phone } = body;

    // Verificar que el cliente existe Y pertenece al usuario actual
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        id,
        userId: dbUser.id, // 🔒 CRÍTICO: Solo cliente del usuario actual
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Verificar si ya existe otro cliente con el mismo email PARA ESTE USUARIO
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findFirst({
        where: { 
          userId: dbUser.id, // 🔒 Buscar solo en clientes del usuario actual
          email,
          id: { not: id },
        },
      });

      if (emailExists) {
        return NextResponse.json({ error: 'Ya tienes otro cliente con este email' }, { status: 400 });
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
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

// DELETE - Eliminar cliente específico del usuario actual
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbUser } = await getOrCreateUser();

    // Verificar que el cliente existe Y pertenece al usuario actual
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        id,
        userId: dbUser.id, // 🔒 CRÍTICO: Solo cliente del usuario actual
      },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Verificar si el cliente tiene citas pendientes DEL USUARIO ACTUAL
    const pendingAppointments = await prisma.appointment.count({
      where: {
        customerId: id,
        userId: dbUser.id, // 🔒 Solo citas del usuario actual
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
      where: { id },
    });

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 