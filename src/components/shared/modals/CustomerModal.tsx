'use client';

import React from 'react';
import BaseModal from './BaseModal';
import { Customer, AppointmentStatus } from '@/types';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils/formatters';
import { getCustomerStatus } from '@/lib/utils/status';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  isLoading?: boolean;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  showActions?: boolean;
}

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  isLoading = false,
  onEdit,
  onDelete,
  showActions = true
}: CustomerModalProps) {
  if (!customer && !isLoading) {
    return null;
  }

  const renderCustomerContent = () => {
    if (isLoading || !customer) {
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

    const status = getCustomerStatus(customer);
    const totalIncome = customer.totalIncome || 0;
    const appointmentCount = customer._count?.appointments || customer.appointments?.length || 0;

    return (
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {customer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(customer)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(customer)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{customer.email || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-gray-900">
                {customer.phone ? formatPhone(customer.phone) : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cliente desde</label>
              <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Total citas</label>
              <p className="text-gray-900 font-semibold">{appointmentCount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ingresos generados</label>
              <p className="text-gray-900 font-semibold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última cita</label>
              <p className="text-gray-900">
                {customer.lastAppointment ? formatDate(customer.lastAppointment) : 'Nunca'}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment History */}
        {customer.appointments && customer.appointments.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Historial de Citas ({customer.appointments.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customer.appointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatDate(appointment.date)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === AppointmentStatus.COMPLETED 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === AppointmentStatus.CANCELLED
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status === AppointmentStatus.COMPLETED ? 'Completada' :
                           appointment.status === AppointmentStatus.CANCELLED ? 'Cancelada' : 'Pendiente'}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {appointment.duration} min
                      </p>
                      {(appointment.internalPrice || appointment.publicPrice) && (
                        <p className="text-sm text-green-600 font-medium">
                          {formatCurrency(appointment.internalPrice || appointment.publicPrice || 0)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State for No Appointments */}
        {customer.appointments && customer.appointments.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin citas registradas</h3>
            <p className="text-gray-500">Este cliente aún no tiene citas en el sistema.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoading ? "Cargando información del cliente..." : `Información del Cliente`}
      size="lg"
    >
      {renderCustomerContent()}
    </BaseModal>
  );
} 