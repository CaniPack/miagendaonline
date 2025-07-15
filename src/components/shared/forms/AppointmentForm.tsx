'use client';

import React, { useState, useEffect } from 'react';
import { FormField } from './FormField';
import { FormSection, FormGrid, FormActions } from './FormSection';
import LoadingSpinner from '../LoadingSpinner';
import { Appointment, Customer, AppointmentFormData, AppointmentStatus } from '@/types';
import { Calendar, Clock, User, DollarSign, FileText } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  customers?: Customer[];
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  loadingCustomers?: boolean;
  mode?: 'create' | 'edit';
  defaultDate?: string;
  defaultTime?: string;
  className?: string;
}

interface FormData {
  customerId: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  internalComment: string;
  publicPrice: number | '';
  internalPrice: number | '';
  status: AppointmentStatus;
}

interface FormErrors {
  customerId?: string;
  date?: string;
  time?: string;
  duration?: string;
  notes?: string;
  internalComment?: string;
  publicPrice?: string;
  internalPrice?: string;
  status?: string;
}

export function AppointmentForm({
  appointment,
  customers = [],
  onSubmit,
  onCancel,
  isLoading = false,
  loadingCustomers = false,
  mode = 'create',
  defaultDate,
  defaultTime,
  className
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customerId: appointment?.customer?.id || '',
    date: appointment?.date ? new Date(appointment.date).toISOString().split('T')[0] : defaultDate || '',
    time: appointment?.date ? new Date(appointment.date).toTimeString().slice(0, 5) : defaultTime || '',
    duration: appointment?.duration || 60,
    notes: appointment?.notes || '',
    internalComment: appointment?.internalComment || '',
    publicPrice: appointment?.publicPrice || '',
    internalPrice: appointment?.internalPrice || '',
    status: appointment?.status || AppointmentStatus.PENDING
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar formulario cuando cambie la cita
  useEffect(() => {
    if (appointment) {
      setFormData({
        customerId: appointment.customer?.id || '',
        date: new Date(appointment.date).toISOString().split('T')[0],
        time: new Date(appointment.date).toTimeString().slice(0, 5),
        duration: appointment.duration || 60,
        notes: appointment.notes || '',
        internalComment: appointment.internalComment || '',
        publicPrice: appointment.publicPrice || '',
        internalPrice: appointment.internalPrice || '',
        status: appointment.status
      });
    }
  }, [appointment]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Selecciona un cliente';
    }

    if (!formData.date) {
      newErrors.date = 'Selecciona una fecha';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Selecciona una hora';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }

    if (formData.publicPrice !== '' && formData.publicPrice < 0) {
      newErrors.publicPrice = 'El precio no puede ser negativo';
    }

    if (formData.internalPrice !== '' && formData.internalPrice < 0) {
      newErrors.internalPrice = 'El precio no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? (value === '' ? '' : Number(value))
        : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData: AppointmentFormData = {
        customerId: formData.customerId,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        notes: formData.notes,
        internalComment: formData.internalComment,
        publicPrice: formData.publicPrice === '' ? undefined : Number(formData.publicPrice),
        internalPrice: formData.internalPrice === '' ? undefined : Number(formData.internalPrice),
        status: formData.status
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: customer.name,
    disabled: false
  }));

  const statusOptions = Object.values(AppointmentStatus).map(status => ({
    value: status,
    label: status === AppointmentStatus.PENDING ? 'Pendiente' :
           status === AppointmentStatus.CONFIRMED ? 'Confirmada' :
           status === AppointmentStatus.CANCELLED ? 'Cancelada' : 'Completada'
  }));

  const durationOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 min' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' }
  ];

  if (loadingCustomers) {
    return (
      <div className="space-y-6">
        <LoadingSpinner text="Cargando clientes..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        
        {/* Información Básica */}
        <FormSection
          title="Información de la Cita"
          description="Detalles básicos de la cita"
          icon={<Calendar className="w-5 h-5" />}
          variant="card"
        >
          <FormGrid columns={2}>
            <FormField
              label="Cliente"
              name="customerId"
              type="select"
              value={formData.customerId}
              onChange={handleInputChange}
              options={customerOptions}
              placeholder="Selecciona un cliente"
              error={errors.customerId}
              required
              icon={<User className="w-4 h-4" />}
            />

            <FormField
              label="Estado"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
              error={errors.status}
              required
            />

            <FormField
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              error={errors.date}
              required
            />

            <FormField
              label="Hora"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              error={errors.time}
              required
              icon={<Clock className="w-4 h-4" />}
            />

            <FormField
              label="Duración"
              name="duration"
              type="select"
              value={formData.duration}
              onChange={handleInputChange}
              options={durationOptions}
              error={errors.duration}
              required
            />
          </FormGrid>
        </FormSection>

        {/* Precios */}
        <FormSection
          title="Información de Precios"
          description="Precios para esta cita (opcional)"
          icon={<DollarSign className="w-5 h-5" />}
          variant="card"
        >
          <FormGrid columns={2}>
            <FormField
              label="Precio Público"
              name="publicPrice"
              type="number"
              value={formData.publicPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              min={0}
              step={0.01}
              error={errors.publicPrice}
              helperText="Precio visible para el cliente"
            />

            <FormField
              label="Precio Interno"
              name="internalPrice"
              type="number"
              value={formData.internalPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              min={0}
              step={0.01}
              error={errors.internalPrice}
              helperText="Para uso interno (no visible al cliente)"
            />
          </FormGrid>
        </FormSection>

        {/* Notas */}
        <FormSection
          title="Notas y Comentarios"
          description="Información adicional sobre la cita"
          icon={<FileText className="w-5 h-5" />}
          variant="card"
        >
          <FormGrid columns={1}>
            <FormField
              label="Notas (visibles para el cliente)"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notas sobre la cita..."
              rows={3}
              error={errors.notes}
              helperText="Estas notas serán visibles para el cliente"
            />

            <FormField
              label="Comentario interno"
              name="internalComment"
              type="textarea"
              value={formData.internalComment}
              onChange={handleInputChange}
              placeholder="Comentarios internos..."
              rows={3}
              error={errors.internalComment}
              helperText="Solo para uso interno, no visible al cliente"
            />
          </FormGrid>
        </FormSection>

        {/* Acciones */}
        <FormActions>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'create' ? 'Creando...' : 'Guardando...'}
              </div>
            ) : (
              mode === 'create' ? 'Crear Cita' : 'Guardar Cambios'
            )}
          </button>
        </FormActions>
      </div>
    </form>
  );
} 