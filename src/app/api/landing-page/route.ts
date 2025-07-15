import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth-helper';

// GET - Obtener landing page del usuario
export async function GET() {
  try {
    const { dbUser } = await getOrCreateUser();

    const landingPage = await prisma.landingPage.findUnique({
      where: { userId: dbUser.id },
    });

    return NextResponse.json({ landingPage });
  } catch (error) {
    console.error('Error al obtener landing page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST/PUT - Crear o actualizar landing page
export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();
    const data = await request.json();

    // Generar slug único basado en el nombre profesional
    const slug = data.professionalName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim();

    // Verificar si ya existe el slug
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await prisma.landingPage.findUnique({
        where: { 
          slug: finalSlug,
          NOT: { userId: dbUser.id } // Excluir la landing page del usuario actual
        },
      });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const landingPage = await prisma.landingPage.upsert({
      where: { userId: dbUser.id },
      update: {
        ...data,
        slug: finalSlug,
      },
      create: {
        ...data,
        userId: dbUser.id,
        slug: finalSlug,
      },
    });

    return NextResponse.json({ landingPage });
  } catch (error) {
    console.error('Error al guardar landing page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 