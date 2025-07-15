"use client";

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  LinkIcon,
  SettingsIcon,
} from 'lucide-react';

interface GoogleCalendarIntegrationProps {
  className?: string;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({ 
  className = "" 
}) => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verificar estado de conexión al cargar
  useEffect(() => {
    checkConnectionStatus();
    
    // Verificar mensajes de URL (callback de Google)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_success')) {
      setSuccess('¡Google Calendar conectado exitosamente!');
      checkConnectionStatus();
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('google_error')) {
      setError('Error al conectar con Google Calendar. Inténtalo de nuevo.');
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/auth/google', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setConnected(data.connected);
        setSyncEnabled(data.syncEnabled);
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const connectToGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/google');
      if (response.ok) {
        const data = await response.json();
        // Redirigir a Google para autorización
        window.location.href = data.authUrl;
      } else {
        setError('Error al iniciar conexión con Google');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromGoogle = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/google', { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        setConnected(false);
        setSyncEnabled(false);
        setSuccess('Desconectado de Google Calendar');
      } else {
        setError('Error al desconectar');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const syncAllAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/sync-all', { 
        method: 'POST' 
      });
      
      if (response.ok) {
        setSuccess('Todas las citas sincronizadas exitosamente');
      } else {
        const data = await response.json();
        setError(data.error || 'Error al sincronizar citas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">
          Integración con Google Calendar
        </h3>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}

      {/* Estado de conexión */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connected ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <div>
              <p className="font-medium text-gray-900">
                {connected ? 'Conectado a Google Calendar' : 'No conectado'}
              </p>
              <p className="text-sm text-gray-600">
                {connected 
                  ? 'Las citas se pueden sincronizar automáticamente'
                  : 'Conecta para sincronizar citas y enviar invitaciones'
                }
              </p>
            </div>
          </div>
          
          {connected && (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        {!connected ? (
          <button
            onClick={connectToGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LinkIcon className="h-4 w-4 mr-2" />
            )}
            Conectar con Google Calendar
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={syncAllAppointments}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 mr-2" />
              )}
              Sincronizar Todas las Citas
            </button>
            
            <button
              onClick={disconnectFromGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Las citas se sincronizarán automáticamente con tu Google Calendar</li>
          <li>• Se enviarán invitaciones por email a tus clientes</li>
          <li>• Los cambios en las citas se actualizarán automáticamente</li>
          <li>• Recibirás recordatorios antes de cada cita</li>
        </ul>
      </div>
    </div>
  );
}; 