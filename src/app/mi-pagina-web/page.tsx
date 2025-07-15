"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useLandingPage } from "@/hooks";
import { LoadingSpinner } from "@/components/shared";
import { useToast } from "@/components/ToastProvider";
import {
  Globe,
  Save,
  Palette,
  Layout,
  Phone,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Briefcase,
  ArrowLeft,
  ImageIcon,
  FileTextIcon,
  Search,
  MessageCircleQuestion,
  BarChart3,
} from "lucide-react";

export default function MiPaginaWebPage() {
  const { user } = useAuthUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'calendar' | 'form' | 'design' | 'contact' | 'seo' | 'faqs' | 'analytics'>('info');

  const {
    landingPageData,
    colorSchemes,
    availableFields,
    loading,
    saving,
    uploadingImage,
    error,
    updateLandingPageData,
    saveLandingPage,
    handleImageUpload,
    addFormField,
    removeFormField,
    updateFormField,
    addService,
    removeService,
    updateService,
    getPreviewUrl,
    validateData,
    clearError,
  } = useLandingPage();

  const handleSave = async () => {
    try {
      const validationErrors = validateData();
      if (validationErrors.length > 0) {
        showToast({ 
          type: 'error', 
          title: 'Error de validación', 
          message: validationErrors.join(', ') 
        });
        return;
      }

      await saveLandingPage();
      showToast({ 
        type: 'success', 
        title: 'Éxito', 
        message: 'Configuración guardada exitosamente' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Error', 
        message: 'Error al guardar la configuración' 
      });
    }
  };

  const handleImageSelect = async (file: File, imageType: 'profileImage' | 'coverImage' | 'logo') => {
    try {
      const url = await handleImageUpload(file);
      updateLandingPageData({ [imageType]: url });
      showToast({ 
        type: 'success', 
        title: 'Éxito', 
        message: 'Imagen subida exitosamente' 
      });
    } catch (err) {
      showToast({ 
        type: 'error', 
        title: 'Error', 
        message: 'Error al subir la imagen' 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const renderImageUpload = (
    label: string,
    imageType: 'profileImage' | 'coverImage' | 'logo',
    currentImage?: string,
    description?: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={label}
              width={80}
              height={80}
              className="h-20 w-20 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file, imageType);
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploadingImage}
          />
          {uploadingImage && (
            <div className="mt-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Profesional *
          </label>
          <input
            type="text"
            value={landingPageData.professionalName}
            onChange={(e) => updateLandingPageData({ professionalName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dr. Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Profesional *
          </label>
          <input
            type="text"
            value={landingPageData.title}
            onChange={(e) => updateLandingPageData({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Especialista en Dermatología"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Eslogan/Tagline
        </label>
        <input
          type="text"
          value={landingPageData.tagline}
          onChange={(e) => updateLandingPageData({ tagline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tu salud es nuestra prioridad"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={landingPageData.description}
          onChange={(e) => updateLandingPageData({ description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe tu experiencia profesional y servicios..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Personalizada
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            /p/
          </span>
          <input
            type="text"
            value={landingPageData.slug}
            onChange={(e) => updateLandingPageData({ slug: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="mi-nombre-profesional"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderImageUpload(
          "Foto de Perfil", 
          "profileImage", 
          landingPageData.profileImage,
          "Imagen cuadrada recomendada (400x400px)"
        )}
        
        {renderImageUpload(
          "Imagen de Portada", 
          "coverImage", 
          landingPageData.coverImage,
          "Imagen horizontal recomendada (1200x400px)"
        )}
        
        {renderImageUpload(
          "Logo", 
          "logo", 
          landingPageData.logo,
          "Logo transparente recomendado (200x200px)"
        )}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Servicios Ofrecidos</h3>
        <button
          onClick={addService}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Servicio
        </button>
      </div>

      {landingPageData.services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay servicios agregados</p>
          <p className="text-sm text-gray-400 mt-1">Agrega servicios para mostrar en tu página</p>
        </div>
      ) : (
        <div className="space-y-4">
          {landingPageData.services.map((service, index) => (
            <div key={service.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Servicio {index + 1}</h4>
                <button
                  onClick={() => removeService(service.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(service.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Consulta General"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => updateService(service.id, { price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$50.000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) => updateService(service.id, { description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción detallada del servicio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={service.duration || landingPageData.appointmentDuration}
                    onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo entre citas (minutos)
                  </label>
                  <input
                    type="number"
                    value={service.bufferTime || landingPageData.bufferTime}
                    onChange={(e) => updateService(service.id, { bufferTime: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalendarSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="showCalendar"
          checked={landingPageData.showCalendar}
          onChange={(e) => updateLandingPageData({ showCalendar: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showCalendar" className="text-sm font-medium text-gray-700">
          Mostrar calendario de citas
        </label>
      </div>

      {landingPageData.showCalendar && (
        <div className="space-y-4 pl-7">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Calendario
            </label>
            <input
              type="text"
              value={landingPageData.calendarDescription || ''}
              onChange={(e) => updateLandingPageData({ calendarDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agenda tu cita"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración por defecto (minutos)
              </label>
              <input
                type="number"
                value={landingPageData.appointmentDuration}
                onChange={(e) => updateLandingPageData({ appointmentDuration: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo entre citas (minutos)
              </label>
              <input
                type="number"
                value={landingPageData.bufferTime}
                onChange={(e) => updateLandingPageData({ bufferTime: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto del botón
              </label>
              <input
                type="text"
                value={landingPageData.buttonText}
                onChange={(e) => updateLandingPageData({ buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agendar Cita"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requirePayment"
              checked={landingPageData.requirePayment}
              onChange={(e) => updateLandingPageData({ requirePayment: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requirePayment" className="text-sm font-medium text-gray-700">
              Requerir pago al agendar
            </label>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Campos del Formulario</h3>
        {availableFields.length > 0 && (
          <select
            onChange={(e) => {
              const field = availableFields.find(f => f.name === e.target.value);
              if (field) {
                addFormField(field);
                e.target.value = '';
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">Agregar campo</option>
            {availableFields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-3">
        {landingPageData.formFields.map((field, index) => (
          <div key={`${field.name}-${index}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateFormField(index, { label: e.target.value })}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Etiqueta del campo"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={field.type}
                    onChange={(e) => updateFormField(index, { type: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="tel">Teléfono</option>
                    <option value="number">Número</option>
                    <option value="textarea">Texto largo</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateFormField(index, { required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Requerido</label>
                </div>
              </div>
            </div>
            {landingPageData.formFields.length > 1 && (
              <button
                onClick={() => removeFormField(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDesignSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Esquema de Colores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                landingPageData.colorScheme === scheme.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateLandingPageData({ colorScheme: scheme.id })}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: scheme.primary }}
                ></div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: scheme.secondary }}
                ></div>
              </div>
              <h4 className="font-medium text-gray-900">{scheme.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {scheme.primary} • {scheme.secondary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            +56
          </span>
          <input
            type="tel"
            value={landingPageData.whatsapp || ''}
            onChange={(e) => updateLandingPageData({ whatsapp: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="912345678"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            @
          </span>
          <input
            type="text"
            value={landingPageData.instagram || ''}
            onChange={(e) => updateLandingPageData({ instagram: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="mi_usuario"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email de Contacto
        </label>
        <input
          type="email"
          value={landingPageData.contactEmail || ''}
          onChange={(e) => updateLandingPageData({ contactEmail: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="contacto@ejemplo.com"
        />
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Optimización SEO</h4>
        <p className="text-sm text-blue-700">
          Mejora la visibilidad de tu página en buscadores como Google y Bing configurando estos campos SEO.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título SEO (Meta Title) *
          </label>
          <input
            type="text"
            value={landingPageData.metaTitle || ''}
            onChange={(e) => updateLandingPageData({ metaTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dr. Juan Pérez - Especialista en Dermatología"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo 60 caracteres. Aparece en los resultados de búsqueda.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palabra Clave Principal
          </label>
          <input
            type="text"
            value={landingPageData.focusKeyword || ''}
            onChange={(e) => updateLandingPageData({ focusKeyword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="dermatólogo Santiago"
          />
          <p className="text-xs text-gray-500 mt-1">
            Palabra clave principal por la que quieres aparecer.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción SEO (Meta Description) *
        </label>
        <textarea
          value={landingPageData.metaDescription || ''}
          onChange={(e) => updateLandingPageData({ metaDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Agenda tu consulta dermatológica con el Dr. Juan Pérez. Especialista en tratamientos de piel con más de 10 años de experiencia."
          maxLength={160}
        />
        <p className="text-xs text-gray-500 mt-1">
          Máximo 160 caracteres. Descripción que aparece en los resultados de búsqueda.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Palabras Clave Secundarias
        </label>
        <input
          type="text"
          value={landingPageData.seoKeywords || ''}
          onChange={(e) => updateLandingPageData({ seoKeywords: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="dermatología, tratamientos piel, consulta dermatológica, especialista piel"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separadas por comas. Palabras relacionadas con tu especialidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Negocio
          </label>
          <select
            value={landingPageData.businessType || ''}
            onChange={(e) => updateLandingPageData({ businessType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            <option value="MedicalOrganization">Organización Médica</option>
            <option value="HealthAndBeautyBusiness">Salud y Belleza</option>
            <option value="ProfessionalService">Servicio Profesional</option>
            <option value="LocalBusiness">Negocio Local</option>
            <option value="EducationalOrganization">Organización Educativa</option>
            <option value="SportsActivityLocation">Actividad Deportiva</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área de Servicio
          </label>
          <input
            type="text"
            value={landingPageData.serviceArea || ''}
            onChange={(e) => updateLandingPageData({ serviceArea: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Santiago, Las Condes, Providencia"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ciudades o áreas donde ofreces tus servicios.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFAQsSettings = () => {
    const faqs = JSON.parse(landingPageData.faqs || '[]');
    
    const addFAQ = () => {
      const newFAQ = {
        id: Date.now().toString(),
        question: '',
        answer: '',
        summary: '',
        keywords: []
      };
      updateLandingPageData({ 
        faqs: JSON.stringify([...faqs, newFAQ]) 
      });
    };

    const updateFAQ = (index: number, updates: any) => {
      const updatedFAQs = [...faqs];
      updatedFAQs[index] = { ...updatedFAQs[index], ...updates };
      updateLandingPageData({ 
        faqs: JSON.stringify(updatedFAQs) 
      });
    };

    const removeFAQ = (index: number) => {
      const updatedFAQs = faqs.filter((_: any, i: number) => i !== index);
      updateLandingPageData({ 
        faqs: JSON.stringify(updatedFAQs) 
      });
    };

    const suggestedQuestions = [
      `¿Qué servicios ofrece ${landingPageData.professionalName || 'el profesional'}?`,
      `¿Cuánto cuesta una consulta con ${landingPageData.professionalName || 'el profesional'}?`,
      `¿Cómo puedo agendar una cita?`,
      `¿Dónde está ubicada la consulta?`,
      `¿Cuál es la experiencia del profesional?`,
      `¿Qué incluye la consulta?`,
      `¿Aceptan seguros médicos?`,
      `¿Hay descuentos disponibles?`
    ];

    return (
      <div className="space-y-6">
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-green-900 mb-2">Optimización para IA (AEO)</h4>
          <p className="text-sm text-green-700 mb-3">
            Las preguntas frecuentes optimizadas ayudan a que tu página aparezca como respuesta en ChatGPT, Google AI y otros buscadores de IA.
          </p>
          <div className="text-xs text-green-600">
            <strong>Consejos:</strong> 
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Responde preguntas que realmente hacen tus clientes</li>
              <li>Las primeras 2 líneas deben ser la respuesta directa</li>
              <li>Incluye palabras clave naturalmente</li>
              <li>Cada respuesta debe funcionar independientemente</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
          <button
            onClick={addFAQ}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircleQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay preguntas frecuentes agregadas</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Preguntas sugeridas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto">
                {suggestedQuestions.slice(0, 6).map((question, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newFAQ = {
                        id: Date.now().toString(),
                        question,
                        answer: '',
                        summary: '',
                        keywords: []
                      };
                      updateLandingPageData({ 
                        faqs: JSON.stringify([newFAQ]) 
                      });
                    }}
                    className="text-left p-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq: any, index: number) => (
              <div key={faq.id || index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">FAQ {index + 1}</h4>
                  <button
                    onClick={() => removeFAQ(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pregunta *
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, { question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="¿Cuánto cuesta una consulta?"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe la pregunta tal como la haría un cliente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respuesta Completa *
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, { answer: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="La consulta cuesta $50.000. Esto incluye evaluación completa, diagnóstico y plan de tratamiento. También ofrecemos planes de pago y descuentos para estudiantes..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Importante:</strong> Las primeras 1-2 líneas deben ser la respuesta directa y clara.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resumen (Para IA)
                    </label>
                    <input
                      type="text"
                      value={faq.summary}
                      onChange={(e) => updateFAQ(index, { summary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Consulta $50.000, incluye evaluación y plan de tratamiento"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Versión muy corta de la respuesta para cuando la IA cite tu página.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palabras Clave
                    </label>
                    <input
                      type="text"
                      value={faq.keywords?.join(', ') || ''}
                      onChange={(e) => updateFAQ(index, { 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="precio consulta, costo dermatólogo, valor tratamiento"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separadas por comas. Palabras que la gente buscaría para esta pregunta.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsSettings = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Analytics & Verificación</h4>
        <p className="text-sm text-purple-700">
          Conecta herramientas de análisis y verifica tu página en buscadores para mejorar tu SEO.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={landingPageData.googleAnalyticsId || ''}
            onChange={(e) => updateLandingPageData({ googleAnalyticsId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-gray-500 mt-1">
            ID de Google Analytics para rastrear visitas.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Canónica Personalizada
          </label>
          <input
            type="url"
            value={landingPageData.canonicalUrl || ''}
            onChange={(e) => updateLandingPageData({ canonicalUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://misitioweb.com/mi-pagina"
          />
          <p className="text-xs text-gray-500 mt-1">
            Solo si tienes un dominio personalizado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verificación Google Search Console
          </label>
          <input
            type="text"
            value={landingPageData.googleSiteVerification || ''}
            onChange={(e) => updateLandingPageData({ googleSiteVerification: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="código de verificación"
          />
          <p className="text-xs text-gray-500 mt-1">
            Meta tag de verificación de Google Search Console.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verificación Bing Webmaster Tools
          </label>
          <input
            type="text"
            value={landingPageData.bingSiteVerification || ''}
            onChange={(e) => updateLandingPageData({ bingSiteVerification: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="código de verificación"
          />
          <p className="text-xs text-gray-500 mt-1">
            Meta tag de verificación de Bing Webmaster Tools.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Directivas para Robots
        </label>
        <select
          value={landingPageData.robotsDirective || 'index,follow'}
          onChange={(e) => updateLandingPageData({ robotsDirective: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="index,follow">index,follow (Recomendado)</option>
          <option value="index,nofollow">index,nofollow</option>
          <option value="noindex,follow">noindex,follow</option>
          <option value="noindex,nofollow">noindex,nofollow</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Controla cómo los buscadores indexan tu página.
        </p>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-yellow-900 mb-2">Próximamente</h5>
        <p className="text-sm text-yellow-700">
          • Integración automática con Google Search Console<br/>
          • Reportes de rendimiento SEO<br/>
          • Análisis de palabras clave<br/>
          • Monitoreo de menciones en IA
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'info', label: 'Información Básica', icon: Layout },
    { id: 'services', label: 'Servicios', icon: Briefcase },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'form', label: 'Formulario', icon: FileTextIcon },
    { id: 'design', label: 'Diseño', icon: Palette },
    { id: 'contact', label: 'Contacto', icon: Phone },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'faqs', label: 'Preguntas Frecuentes', icon: MessageCircleQuestion },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Mi Página Web
                  </h1>
                  <p className="text-sm text-gray-500">
                    Configura tu landing page profesional
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getPreviewUrl() && (
                <a
                  href={getPreviewUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver página
                </a>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={landingPageData.isPublished}
                  onChange={(e) => updateLandingPageData({ isPublished: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-700">
                  Publicada
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-red-800 underline"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {activeTab === 'info' && renderBasicInfo()}
              {activeTab === 'services' && renderServices()}
              {activeTab === 'calendar' && renderCalendarSettings()}
              {activeTab === 'form' && renderFormSettings()}
              {activeTab === 'design' && renderDesignSettings()}
              {activeTab === 'contact' && renderContactSettings()}
              {activeTab === 'seo' && renderSEOSettings()}
              {activeTab === 'faqs' && renderFAQsSettings()}
              {activeTab === 'analytics' && renderAnalyticsSettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
