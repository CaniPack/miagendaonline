import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no puede exceder 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory already exists, which is fine
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${userId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Escribir archivo
    await writeFile(filePath, buffer);

    // Generar URL pública
    const publicUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: fileName 
    });

  } catch (error) {
    console.error('Error in upload API:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Error desconocido')
        : undefined
    }, { status: 500 });
  }
} 