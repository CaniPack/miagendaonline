'use client';

import React, { useState, useEffect } from 'react';
import { FormField } from './FormField';
import { FormSection, FormGrid, FormActions } from './FormSection';
import { Customer, CustomerFormData } from '@/types';
import { User, Mail, Phone } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  className
}: CustomerFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar formulario cuando cambie el cliente
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || ''
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre (requerido)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email (opcional pero debe ser válido si se proporciona)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Ingresa un email válido';
      }
    }

    // Validar teléfono (opcional pero debe ser válido si se proporciona)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Ingresa un teléfono válido';
      }
    }

    // Al menos email o teléfono debe estar presente
    if ((!formData.email || !formData.email.trim()) && 
        (!formData.phone || !formData.phone.trim())) {
      const contactError = 'Debe proporcionar al menos un email o teléfono';
      newErrors.email = contactError;
      newErrors.phone = contactError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Limpiar errores de contacto si se proporciona email o teléfono
    if ((name === 'email' || name === 'phone') && value.trim()) {
      setErrors(prev => ({
        ...prev,
        email: prev.email?.includes('al menos') ? undefined : prev.email,
        phone: prev.phone?.includes('al menos') ? undefined : prev.phone
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
      const submitData: CustomerFormData = {
        name: formData.name.trim(),
        email: formData.email.trim() || '',
        phone: formData.phone.trim() || ''
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        
        {/* Información Personal */}
        <FormSection
          title="Información del Cliente"
          description="Datos de contacto del cliente"
          icon={<User className="w-5 h-5" />}
          variant="card"
        >
          <FormGrid columns={1} gap="md">
            <FormField
              label="Nombre completo"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del cliente"
              error={errors.name}
              required
              autoFocus
              icon={<User className="w-4 h-4" />}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="cliente@email.com"
              error={errors.email}
              helperText="Opcional - Se usará para enviar notificaciones"
              icon={<Mail className="w-4 h-4" />}
            />

            <FormField
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+56 9 1234 5678"
              error={errors.phone}
              helperText="Opcional - Se usará para enviar recordatorios por WhatsApp"
              icon={<Phone className="w-4 h-4" />}
            />
          </FormGrid>

          {/* Nota informativa */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>Consejo:</strong> Proporciona al menos un email o teléfono para poder 
              contactar al cliente y enviar recordatorios de citas.
            </p>
          </div>
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
              mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'
            )}
          </button>
        </FormActions>
      </div>
    </form>
  );
} 