"use client";

import React from 'react';
import Navigation from '@/components/Navigation';
import { PageHeader, ContentContainer } from '@/components/shared/layout';
import { GoogleCalendarIntegration } from '@/components/GoogleCalendarIntegration';
import { 
  SettingsIcon,
  BellIcon,
  UserIcon,
  ShieldIcon,
} from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Configuración"
          icon={<SettingsIcon className="h-8 w-8" />}
        />
        
        <ContentContainer>
          <div className="space-y-8">
            {/* Google Calendar Integration */}
            <GoogleCalendarIntegration />
            
            {/* Configuración de Notificaciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <BellIcon className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email de recordatorios</h4>
                    <p className="text-sm text-gray-600">Recibe recordatorios por email antes de las citas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones push</h4>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Configuración de Perfil */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Perfil Profesional
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre profesional
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre como aparecerá en las citas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de consulta
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección donde recibes a tus clientes"
                  />
                </div>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Guardar cambios
                </button>
              </div>
            </div>
            
            {/* Configuración de Privacidad */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <ShieldIcon className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Privacidad y Seguridad
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Exportar datos</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Descarga una copia de todos tus datos almacenados
                  </p>
                  <button className="mt-2 text-yellow-800 font-medium hover:text-yellow-900">
                    Solicitar exportación →
                  </button>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">Eliminar cuenta</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Elimina permanentemente tu cuenta y todos los datos asociados
                  </p>
                  <button className="mt-2 text-red-800 font-medium hover:text-red-900">
                    Eliminar cuenta →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </div>
    </>
  );
} 