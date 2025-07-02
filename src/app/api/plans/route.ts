import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los planes disponibles
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    // Parsear las features de cada plan
    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features),
    }));

    return NextResponse.json(plansWithFeatures);
  } catch (error) {
    console.error('Error en plans API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 