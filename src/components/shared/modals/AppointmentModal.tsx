'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Appointment, AppointmentStatus } from '@/types';
import { formatCurrency, formatDate, formatTime, formatPhone } from '@/lib/utils/formatters';
import { getStatusColor, getStatusText, isValidStatusTransition } from '@/lib/utils/status';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  isLoading?: boolean;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onStatusChange?: (appointmentId: string, newStatus: AppointmentStatus) => void;
  onCustomerClick?: (customerId: string) => void;
  showActions?: boolean;
  readonly?: boolean;
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onCustomerClick,
  showActions = true,
  readonly = false
}: AppointmentModalProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!appointment && !isLoading) {
    return null;
  }

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appointment || !onStatusChange) return;
    
    setIsChangingStatus(true);
    try {
      await onStatusChange(appointment.id, newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getAvailableStatusTransitions = () => {
    if (!appointment) return [];
    
    const allStatuses = Object.values(AppointmentStatus);
    return allStatuses.filter(status => 
      status !== appointment.status && 
      isValidStatusTransition(appointment.status, status)
    );
  };

  const renderAppointmentContent = () => {
    if (isLoading || !appointment) {
      return (
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      );
    }

    const statusColor = getStatusColor(appointment.status);
    const statusText = getStatusText(appointment.status);
    const availableTransitions = getAvailableStatusTransitions();

    return (
      <div className="space-y-6">
        {/* Appointment Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Cita con {appointment.customer.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{formatDate(appointment.date)}</span>
                <span>{formatTime(appointment.date)}</span>
                <span>{appointment.duration} minutos</span>
              </div>
            </div>
            
            {showActions && !readonly && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(appointment)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(appointment)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Cliente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Nombre</label>
              <p className="text-sm text-gray-900">
                {onCustomerClick ? (
                  <button
                    onClick={() => onCustomerClick(appointment.customer.id)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {appointment.customer.name}
                  </button>
                ) : (
                  appointment.customer.name
                )}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{appointment.customer.email || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Teléfono</label>
              <p className="text-sm text-gray-900">
                {appointment.customer.phone ? formatPhone(appointment.customer.phone) : 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Notas públicas</label>
              <p className="text-gray-900 bg-gray-50 rounded-md p-3 min-h-[60px]">
                {appointment.notes || 'Sin notas'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Comentario interno</label>
              <p className="text-gray-900 bg-yellow-50 border border-yellow-200 rounded-md p-3 min-h-[60px]">
                {appointment.internalComment || 'Sin comentarios internos'}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        {(appointment.internalPrice || appointment.publicPrice) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Información de Precios</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appointment.publicPrice && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Precio público</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(appointment.publicPrice)}
                  </p>
                </div>
              )}
              {appointment.internalPrice && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Precio interno</label>
                  <p className="text-lg font-semibold text-green-700">
                    {formatCurrency(appointment.internalPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Management */}
        {!readonly && onStatusChange && availableTransitions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Cambiar Estado</h4>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isChangingStatus}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isChangingStatus 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isChangingStatus ? 'Cambiando...' : `Marcar como ${getStatusText(status)}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Info */}
        {readonly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Esta cita está en modo de solo lectura
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoading ? "Cargando información de la cita..." : "Detalles de la Cita"}
      size="lg"
    >
      {renderAppointmentContent()}
    </BaseModal>
  );
} 