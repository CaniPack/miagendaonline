import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los planes disponibles
export async function GET() {
  try {
    await requireAuth(); // Verificar autenticación

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    // Parsear las features de cada plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plansWithFeatures = plans.map((plan: any) => ({
      ...plan,
      features: JSON.parse(plan.features),
    }));

    return NextResponse.json(plansWithFeatures);
  } catch (error) {
    console.error('Error en plans API:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 