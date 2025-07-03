import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, handleApiError } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los clientes del usuario actual
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    const customers = await prisma.customer.findMany({
      where: {
        userId: dbUser.id, // 🔒 FILTRO CRÍTICO: Solo clientes del usuario actual
      },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5, // Últimas 5 citas
        },
        _count: {
          select: { 
            appointments: true // Ya están filtradas por la relación
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    return handleApiError(error, 'GET customers');
  }
}

// POST - Crear nuevo cliente para el usuario actual
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { name, email, phone } = body;

    // Validación básica
    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Verificar si ya existe un cliente con el mismo email PARA ESTE USUARIO
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          userId: dbUser.id, // 🔒 Solo buscar en clientes del usuario actual
          email 
        },
      });

      if (existingCustomer) {
        return NextResponse.json({ error: 'Ya tienes un cliente con este email' }, { status: 400 });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        userId: dbUser.id, // 🔒 CRÍTICO: Asignar al usuario actual
        name,
        email: email || null,
        phone: phone || null,
      },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST customers');
  }
} 