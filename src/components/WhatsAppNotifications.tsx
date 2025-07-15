"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Phone, User, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface MessageTemplate {
  name: string;
  display_name: string;
  description: string;
  example: string;
}

interface WhatsAppNotificationsProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WhatsAppNotifications({
  customer,
  isOpen,
  onClose,
  onSuccess
}: WhatsAppNotificationsProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone || '');
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');
  const [templateParams, setTemplateParams] = useState<string[]>(['']);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

  // Cargar templates disponibles
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      if (customer?.phone) {
        setPhoneNumber(customer.phone);
      }
    }
  }, [isOpen, customer]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/send');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.defaultTemplates || []);
      }
    } catch (error) {
      console.error('Error al cargar templates:', error);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Remover caracteres no numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validar que tenga al menos 8 dígitos (números chilenos sin código país)
    if (cleanPhone.length < 8) {
      return false;
    }
    
    return true;
  };

  const handleSendMessage = async () => {
    if (!phoneNumber.trim()) {
      setStatus({type: 'error', message: 'Número de teléfono es requerido'});
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setStatus({type: 'error', message: 'Número de teléfono inválido'});
      return;
    }

    if (messageType === 'template' && !selectedTemplate) {
      setStatus({type: 'error', message: 'Selecciona un template'});
      return;
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      setStatus({type: 'error', message: 'Mensaje personalizado es requerido'});
      return;
    }

    setLoading(true);
    setStatus({type: null, message: ''});

    try {
      const payload = {
        customerPhone: phoneNumber,
        customerId: customer?.id,
        ...(messageType === 'template' ? {
          templateName: selectedTemplate,
          templateParams: templateParams.filter(param => param.trim() !== '')
        } : {
          message: customMessage
        })
      };

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({type: 'success', message: 'Mensaje enviado exitosamente por WhatsApp! 🎉'});
        
        // Limpiar formulario
        setCustomMessage('');
        setSelectedTemplate('');
        setTemplateParams(['']);
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      } else {
        setStatus({type: 'error', message: result.error || 'Error al enviar mensaje'});
      }
    } catch (error) {
      console.error('Error al enviar WhatsApp:', error);
      setStatus({type: 'error', message: 'Error de conexión. Inténtalo nuevamente.'});
    } finally {
      setLoading(false);
    }
  };

  const addTemplateParam = () => {
    setTemplateParams([...templateParams, '']);
  };

  const updateTemplateParam = (index: number, value: string) => {
    const newParams = [...templateParams];
    newParams[index] = value;
    setTemplateParams(newParams);
  };

  const removeTemplateParam = (index: number) => {
    if (templateParams.length > 1) {
      const newParams = templateParams.filter((_, i) => i !== index);
      setTemplateParams(newParams);
    }
  };

  const selectedTemplateData = templates.find(t => t.name === selectedTemplate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enviar WhatsApp</h3>
              {customer && (
                <p className="text-sm text-gray-600">{customer.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Número de WhatsApp
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ej: +56912345678 o 912345678"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Incluye código de país o se agregará +56 automáticamente
          </p>
        </div>

        {/* Message Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de mensaje
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="messageType"
                value="template"
                checked={messageType === 'template'}
                onChange={(e) => setMessageType(e.target.value as 'template' | 'custom')}
                className="mr-2"
              />
              Template predefinido
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="messageType"
                value="custom"
                checked={messageType === 'custom'}
                onChange={(e) => setMessageType(e.target.value as 'template' | 'custom')}
                className="mr-2"
              />
              Mensaje personalizado
            </label>
          </div>
        </div>

        {/* Template Selection */}
        {messageType === 'template' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecciona un template...</option>
              {templates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.display_name}
                </option>
              ))}
            </select>

            {/* Template Preview */}
            {selectedTemplateData && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{selectedTemplateData.description}</p>
                <div className="text-sm text-gray-800 font-mono bg-white p-2 rounded border">
                  {selectedTemplateData.example}
                </div>
              </div>
            )}

            {/* Template Parameters */}
            {selectedTemplate && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parámetros del template
                </label>
                {templateParams.map((param, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={param}
                      onChange={(e) => updateTemplateParam(index, e.target.value)}
                      placeholder={`Parámetro ${index + 1} (ej: nombre, fecha, etc.)`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {templateParams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTemplateParam(index)}
                        className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTemplateParam}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Agregar parámetro
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom Message */}
        {messageType === 'custom' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Escribe tu mensaje personalizado aquí..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Los mensajes personalizados solo funcionan si hay una conversación activa con el cliente
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSendMessage}
            disabled={loading || (!selectedTemplate && messageType === 'template') || (!customMessage.trim() && messageType === 'custom') || !phoneNumber.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 