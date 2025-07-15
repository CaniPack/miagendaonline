"use client";

import React from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  DollarSignIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { AppointmentIncome } from '@/hooks/useIncome';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';

interface AppointmentIncomeListProps {
  appointments: AppointmentIncome[];
  loading?: boolean;
  formatCurrency: (amount: number) => string;
  formatDateTime: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onCustomerClick: (customerName: string) => void;
}

export const AppointmentIncomeList: React.FC<AppointmentIncomeListProps> = ({
  appointments,
  loading = false,
  formatCurrency,
  formatDateTime,
  formatTime,
  onCustomerClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CalendarIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          No hay citas registradas
        </p>
        <p className="text-gray-500">
          Las citas aparecerán aquí una vez que se registren en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Historial de Citas e Ingresos
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onCustomerClick(appointment.customer.name)}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                    >
                      {appointment.customer.name}
                    </button>
                    {appointment.customer.phone && (
                      <span className="text-xs text-gray-500">
                        📞 {appointment.customer.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      {formatDateTime(appointment.date)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {appointment.duration} min
                    </span>
                    {appointment.notes && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">
                        {appointment.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(appointment.income)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(appointment.date)}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">{getStatusText(appointment.status)}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 