import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener landing page pública por slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const landingPage = await prisma.landingPage.findUnique({
      where: { 
        slug,
        isPublished: true // Solo mostrar páginas publicadas
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            clerkId: true,
          }
        }
      }
    });

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Error al obtener landing page pública:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 