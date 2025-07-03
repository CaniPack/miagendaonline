import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de imagen...');
    
    const userId = await requireAuth();
    console.log('🔐 Usuario autenticado:', userId);

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('❌ No se encontró archivo en la petición');
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 });
    }

    console.log('📁 Archivo recibido:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de archivo no válido:', file.type);
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Archivo demasiado grande:', file.size);
      return NextResponse.json({ error: 'La imagen no puede exceder 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Archivo convertido a buffer:', buffer.length, 'bytes');

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    console.log('📂 Directorio de destino:', uploadDir);
    
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('✅ Directorio creado/verificado');
    } catch {
      console.log('ℹ️ El directorio ya existe');
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${userId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    console.log('💾 Guardando archivo como:', fileName);

    // Escribir archivo
    await writeFile(filePath, buffer);
    console.log('✅ Archivo guardado exitosamente');

    // Generar URL pública
    const publicUrl = `/uploads/profiles/${fileName}`;
    console.log('🌐 URL pública generada:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: fileName 
    });

  } catch (error) {
    console.error('❌ Error en upload:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 