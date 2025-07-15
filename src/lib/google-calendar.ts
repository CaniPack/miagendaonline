import { google } from 'googleapis';
import { getAuth } from '@clerk/nextjs/server';

// Configuración de Google Calendar
export class GoogleCalendarService {
  private calendar: any;
  private auth: any;

  constructor() {
    // Configurar autenticación con OAuth2
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  // Configurar tokens de acceso del usuario
  setCredentials(tokens: { access_token: string; refresh_token?: string }) {
    this.auth.setCredentials(tokens);
  }

  // Crear evento en Google Calendar
  async createEvent(eventData: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmail?: string;
    location?: string;
    timeZone?: string;
  }) {
    try {
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'America/Santiago',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'America/Santiago',
        },
        attendees: eventData.attendeeEmail ? [
          { email: eventData.attendeeEmail }
        ] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 día antes
            { method: 'popup', minutes: 60 }, // 1 hora antes
          ],
        },
        // Enviar invitaciones automáticamente
        sendUpdates: 'all',
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all', // Envía invitaciones automáticamente
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        event: response.data,
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Actualizar evento existente
  async updateEvent(eventId: string, eventData: {
    summary?: string;
    description?: string;
    startDateTime?: string;
    endDateTime?: string;
    attendeeEmail?: string;
    location?: string;
    timeZone?: string;
  }) {
    try {
      const updateData: any = {};
      
      if (eventData.summary) updateData.summary = eventData.summary;
      if (eventData.description) updateData.description = eventData.description;
      if (eventData.location) updateData.location = eventData.location;
      
      if (eventData.startDateTime) {
        updateData.start = {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'America/Santiago',
        };
      }
      
      if (eventData.endDateTime) {
        updateData.end = {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'America/Santiago',
        };
      }

      if (eventData.attendeeEmail) {
        updateData.attendees = [{ email: eventData.attendeeEmail }];
      }

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updateData,
        sendUpdates: 'all', // Notificar cambios
      });

      return {
        success: true,
        event: response.data,
      };
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Eliminar evento
  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all', // Notificar cancelación
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Obtener URL de autorización para OAuth
  generateAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Forzar consentimiento para obtener refresh_token
    });
  }

  // Intercambiar código de autorización por tokens
  async getTokens(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      return { success: true, tokens };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Verificar si el usuario tiene tokens válidos
  async verifyTokens(tokens: { access_token: string; refresh_token?: string }) {
    try {
      this.setCredentials(tokens);
      
      // Hacer una llamada simple para verificar que los tokens funcionan
      await this.calendar.calendarList.list({ maxResults: 1 });
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

// Instancia singleton del servicio
export const googleCalendarService = new GoogleCalendarService(); 