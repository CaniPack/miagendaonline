import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helper';

// GET - Obtener landing page del usuario
export async function GET() {
  try {
    const userId = getCurrentUser();

    // En desarrollo, asegurar que el usuario existe
    if (process.env.DEVELOPMENT_MODE === 'true') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'juan.perez@ejemplo.com',
          name: 'Juan Pérez',
          phone: '+56912345678',
          role: 'ADMIN',
          clerkId: userId,
        },
      });
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { userId },
    });

    return NextResponse.json(landingPage);
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
    const userId = getCurrentUser();
    const data = await request.json();

    // En desarrollo, asegurar que el usuario existe
    if (process.env.DEVELOPMENT_MODE === 'true') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'juan.perez@ejemplo.com',
          name: 'Juan Pérez',
          phone: '+56912345678',
          role: 'ADMIN',
          clerkId: userId,
        },
      });
    }

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
          NOT: { userId } // Excluir la landing page del usuario actual
        },
      });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const landingPage = await prisma.landingPage.upsert({
      where: { userId },
      update: {
        ...data,
        slug: finalSlug,
      },
      create: {
        ...data,
        userId,
        slug: finalSlug,
      },
    });

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Error al guardar landing page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 