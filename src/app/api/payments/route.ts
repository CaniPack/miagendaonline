import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los pagos del usuario
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
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

// POST - Crear nuevo pago (simulado)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description } = body;

    // Validación básica
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 });
    }

    // Simular procesamiento de pago
    const paymentSuccess = Math.random() > 0.2; // 80% de éxito

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseInt(amount),
        status: paymentSuccess ? 'PAID' : 'FAILED',
        paymentDate: new Date(),
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

    // Crear notificación del pago
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        message: paymentSuccess 
          ? `Pago de $${amount.toLocaleString()} procesado exitosamente`
          : `Error al procesar pago de $${amount.toLocaleString()}`,
        read: false,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error al crear pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 