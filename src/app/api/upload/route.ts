import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload de imagen...');
    
    const { userId } = await getAuthUser();
    console.log('🔐 Usuario autenticado:', userId);
    
    if (!userId) {
      console.log('❌ Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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
    } catch (error) {
      console.log('ℹ️ El directorio ya existe');
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${userId}_${timestamp}${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    console.log('📝 Nombre del archivo:', filename);
    console.log('📍 Ruta completa:', filepath);

    // Guardar archivo
    await writeFile(filepath, buffer);
    console.log('✅ Archivo guardado exitosamente');

    // Retornar URL pública
    const publicUrl = `/uploads/profiles/${filename}`;
    console.log('🌐 URL pública:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });

  } catch (error) {
    console.error('💥 Error al subir imagen:', error);
    console.error('📊 Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
} 