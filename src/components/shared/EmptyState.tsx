"use client";

import React from "react";
import { 
  Calendar,
  Users,
  FileText,
  Search,
  Plus,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmptyStateProps } from "@/types";

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const DefaultIcon = Icon || Inbox;

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <DefaultIcon className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Estados vacíos específicos pre-configurados

export function NoAppointments({ onCreateAppointment }: { onCreateAppointment?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No hay citas programadas"
      description="Parece que no tienes citas para este período. ¡Crea tu primera cita para comenzar!"
      actionLabel="Crear Cita"
      onAction={onCreateAppointment}
    />
  );
}

export function NoCustomers({ onCreateCustomer }: { onCreateCustomer?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay clientes registrados"
      description="Aún no has agregado clientes a tu base de datos. Comienza creando tu primer cliente."
      actionLabel="Agregar Cliente"
      onAction={onCreateCustomer}
    />
  );
}

export function NoSearchResults({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No se encontraron resultados"
      description={`No encontramos resultados para "${searchTerm}". Intenta con otros términos de búsqueda.`}
      actionLabel="Limpiar búsqueda"
      onAction={onClearSearch}
    />
  );
}

export function NoData({ 
  type = "datos",
  onRefresh 
}: { 
  type?: string;
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      icon={FileText}
      title={`No hay ${type} disponibles`}
      description={`No se encontraron ${type} para mostrar en este momento.`}
      actionLabel="Actualizar"
      onAction={onRefresh}
    />
  );
}

export function ErrorState({ 
  error,
  onRetry 
}: { 
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Error al cargar datos"
      description={error || "Ocurrió un error inesperado. Por favor, intenta nuevamente."}
      actionLabel="Reintentar"
      onAction={onRetry}
    />
  );
}

export function LoadingState({ 
  message = "Cargando datos..."
}: { 
  message?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

// Variante compacta para secciones pequeñas
export function CompactEmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps & { className?: string }) {
  const DefaultIcon = Icon || Inbox;

  return (
    <div className={cn("text-center py-8", className)}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <DefaultIcon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h4 className="text-base font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-3 w-3 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Variante para cards/modales
export function CardEmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const DefaultIcon = Icon || FileText;

  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <DefaultIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
      <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Estados específicos para diferentes períodos
export function NoTodayAppointments({ onCreateAppointment }: { onCreateAppointment?: () => void }) {
  return (
    <CompactEmptyState
      icon={Calendar}
      title="No hay citas hoy"
      description="Tu agenda está libre. ¡Perfecto para planificar!"
      actionLabel="Crear Cita"
      onAction={onCreateAppointment}
    />
  );
}

export function NoWeekAppointments({ onCreateAppointment }: { onCreateAppointment?: () => void }) {
  return (
    <CompactEmptyState
      icon={Calendar}
      title="Semana sin citas"
      description="No tienes citas programadas para esta semana."
      actionLabel="Crear Cita"
      onAction={onCreateAppointment}
    />
  );
}

export function NoMonthAppointments({ onCreateAppointment }: { onCreateAppointment?: () => void }) {
  return (
    <CompactEmptyState
      icon={Calendar}
      title="Mes sin actividad"
      description="No hay citas programadas para este mes."
      actionLabel="Crear Cita"
      onAction={onCreateAppointment}
    />
  );
}

// Estado para configuración inicial
export function FirstTimeSetup({
  title = "¡Bienvenido a Mi Agenda Online!",
  description = "Para comenzar, necesitamos configurar algunos datos básicos.",
  onStartSetup,
}: {
  title?: string;
  description?: string;
  onStartSetup?: () => void;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
          <Calendar className="h-12 w-12 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{description}</p>
        
        {onStartSetup && (
          <button
            onClick={onStartSetup}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Comenzar configuración
          </button>
        )}
      </div>
    </div>
  );
} 