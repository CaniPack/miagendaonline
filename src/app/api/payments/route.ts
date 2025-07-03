import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los pagos del usuario
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error en payments API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pago
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    const body = await request.json();
    const { amount, status, paymentDate } = body;

    // Validación básica
    if (!amount) {
      return NextResponse.json({ error: 'El monto es requerido' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: dbUser.id,
        amount,
        status: status || 'PENDING',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error al crear pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 