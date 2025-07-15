import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

// Configuración de WhatsApp Business API
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface WhatsAppMessagePayload {
  messaging_product: string;
  to: string;
  type: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

// POST - Enviar notificación por WhatsApp
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { dbUser } = await getOrCreateUser();

    // Validar configuración de WhatsApp
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'WhatsApp API no configurada. Contacte al administrador.' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { 
      customerPhone, 
      message, 
      templateName, 
      templateParams = [],
      customerId,
      appointmentId 
    } = body;

    // Validación básica
    if (!customerPhone || (!message && !templateName)) {
      return NextResponse.json({ 
        error: 'Teléfono del cliente y mensaje/template son requeridos' 
      }, { status: 400 });
    }

    // Validar que el cliente pertenece al usuario (si se proporciona customerId)
    if (customerId) {
      const customerCount = await prisma.customer.count({
        where: { 
          id: customerId,
          userId: dbUser.id
        }
      });

      if (customerCount === 0) {
        return NextResponse.json({ 
          error: 'Cliente no encontrado o no tienes acceso' 
        }, { status: 404 });
      }
    }

    // Limpiar número de teléfono (remover espacios, guiones, etc.)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    
    // Agregar código de país si no existe (asumir Chile +56)
    const phoneWithCountryCode = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`;

    // Preparar payload para WhatsApp API
    let messagePayload: WhatsAppMessagePayload;

    if (templateName) {
      // Usar template predefinido
      messagePayload = {
        messaging_product: "whatsapp",
        to: phoneWithCountryCode,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "es_ES" // Español
          }
        }
      };

      // Agregar parámetros si existen
      if (templateParams.length > 0) {
        messagePayload.template!.components = [{
          type: "body",
          parameters: templateParams.map((param: string) => ({
            type: "text",
            text: param
          }))
        }];
      }
    } else {
      // Mensaje de texto simple (solo funciona si hay conversación activa)
      messagePayload = {
        messaging_product: "whatsapp",
        to: phoneWithCountryCode,
        type: "text",
        text: {
          body: message
        }
      };
    }

    // Enviar mensaje a WhatsApp API
    const whatsappResponse = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      }
    );

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('Error al enviar WhatsApp:', whatsappResult);
      return NextResponse.json({ 
        error: 'Error al enviar mensaje por WhatsApp',
        details: whatsappResult.error?.message || 'Error desconocido'
      }, { status: 400 });
    }

    // Registrar la notificación en la base de datos
    const notification = await prisma.notification.create({
      data: {
        userId: dbUser.id,
        type: 'WHATSAPP',
        message: `WhatsApp enviado a ${customerPhone}: ${message || `Template: ${templateName}`}`,
        read: false,
      },
    });

    // Log para debugging
    console.log('WhatsApp enviado exitosamente:', {
      messageId: whatsappResult.messages?.[0]?.id,
      to: phoneWithCountryCode,
      user: dbUser.email
    });

    return NextResponse.json({
      success: true,
      messageId: whatsappResult.messages?.[0]?.id,
      notification: notification,
      message: 'Mensaje enviado por WhatsApp exitosamente'
    }, { status: 200 });

  } catch (error) {
    console.error('Error en API WhatsApp:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET - Obtener templates disponibles
export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await getOrCreateUser();

    // Validar configuración
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'WhatsApp API no configurada' 
      }, { status: 500 });
    }

    // Obtener templates desde WhatsApp API
    const templatesResponse = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        }
      }
    );

    if (!templatesResponse.ok) {
      return NextResponse.json({ 
        error: 'Error al obtener templates de WhatsApp' 
      }, { status: 400 });
    }

    const templatesResult = await templatesResponse.json();

    // Templates predefinidos comunes para profesionales
    const defaultTemplates = [
      {
        name: 'cita_recordatorio',
        display_name: 'Recordatorio de Cita',
        description: 'Recordatorio automático de cita próxima',
        example: 'Hola {{nombre}}, te recordamos tu cita el {{fecha}} a las {{hora}}. ¡Te esperamos!'
      },
      {
        name: 'cita_confirmacion',
        display_name: 'Confirmación de Cita',
        description: 'Confirmación de nueva cita agendada',
        example: 'Hola {{nombre}}, tu cita ha sido confirmada para el {{fecha}} a las {{hora}}.'
      },
      {
        name: 'cita_cancelacion',
        display_name: 'Cancelación de Cita',
        description: 'Notificación de cancelación de cita',
        example: 'Hola {{nombre}}, lamentamos informarte que tu cita del {{fecha}} ha sido cancelada.'
      },
      {
        name: 'seguimiento_general',
        display_name: 'Seguimiento General',
        description: 'Mensaje de seguimiento post-servicio',
        example: 'Hola {{nombre}}, ¿cómo te ha ido después de tu última visita? ¿Tienes alguna consulta?'
      }
    ];

    return NextResponse.json({
      whatsappTemplates: templatesResult.data || [],
      defaultTemplates: defaultTemplates
    });

  } catch (error) {
    console.error('Error al obtener templates:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 