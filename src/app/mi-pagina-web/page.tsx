'use client';

import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { 
  Globe, 
  Eye, 
  Save, 
  Palette, 
  Layout, 
  Phone, 
  Instagram, 
  Mail,
  Plus,
  Trash2,
  Settings,
  ExternalLink,
  Upload,
  User,
  Calendar,
  Briefcase,
  DollarSign,
  Image,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
}

interface LandingPageData {
  id?: string;
  professionalName: string;
  title: string;
  tagline: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  logo?: string;
  services: Service[];
  showCalendar: boolean;
  calendarDescription?: string;
  appointmentDuration: number;
  bufferTime: number;
  buttonText: string;
  requirePayment: boolean;
  formFields: FormField[];
  whatsapp?: string;
  instagram?: string;
  contactEmail?: string;
  colorScheme: string;
  slug: string;
  isPublished: boolean;
}

const defaultFormFields: FormField[] = [
  { name: 'name', label: 'Nombre', type: 'text', required: true },
  { name: 'lastName', label: 'Apellido', type: 'text', required: true },
  { name: 'email', label: 'Correo', type: 'email', required: true },
  { name: 'comment', label: 'Comentario', type: 'textarea', required: false },
];

const availableFields = [
  { name: 'phone', label: 'Teléfono', type: 'tel' },
  { name: 'age', label: 'Edad', type: 'number' },
  { name: 'reason', label: 'Motivo de consulta', type: 'textarea' },
  { name: 'previousExperience', label: 'Experiencia previa', type: 'textarea' },
  { name: 'referral', label: '¿Cómo nos conociste?', type: 'text' },
];

const colorSchemes = [
  { id: 'blue', name: 'Azul Profesional', primary: '#2563eb', secondary: '#dbeafe' },
  { id: 'green', name: 'Verde Natural', primary: '#16a34a', secondary: '#dcfce7' },
  { id: 'purple', name: 'Morado Elegante', primary: '#9333ea', secondary: '#f3e8ff' },
  { id: 'orange', name: 'Naranja Energético', primary: '#ea580c', secondary: '#fed7aa' },
];

export default function MiPaginaWebPage() {
  const { user } = useAuthUser();
  const { showSuccess, showError } = useToast();
  const [landingPage, setLandingPage] = useState<LandingPageData>({
    professionalName: user?.firstName + ' ' + user?.lastName || '',
    title: '',
    tagline: '',
    description: '',
    services: [],
    showCalendar: true,
    calendarDescription: 'Selecciona una fecha y hora disponible para agendar tu cita',
    appointmentDuration: 60,
    bufferTime: 0,
    buttonText: 'Agendar Hora',
    requirePayment: false,
    formFields: defaultFormFields,
    colorScheme: 'blue',
    slug: '',
    isPublished: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'calendar' | 'form' | 'contact' | 'design'>('info');

  useEffect(() => {
    fetchLandingPage();
  }, []);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch('/api/landing-page');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Parsear los campos JSON y asegurar que services sea un array
          let parsedServices = [];
          try {
            parsedServices = data.services ? JSON.parse(data.services) : [];
          } catch (e) {
            console.error('Error parsing services:', e);
            parsedServices = [];
          }

          let parsedFormFields = defaultFormFields;
          try {
            parsedFormFields = data.formFields ? JSON.parse(data.formFields) : defaultFormFields;
          } catch (e) {
            console.error('Error parsing formFields:', e);
            parsedFormFields = defaultFormFields;
          }

          setLandingPage({
            ...data,
            formFields: parsedFormFields,
            services: Array.isArray(parsedServices) ? parsedServices : [],
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...landingPage,
        formFields: JSON.stringify(Array.isArray(landingPage.formFields) ? landingPage.formFields : defaultFormFields),
        services: JSON.stringify(Array.isArray(landingPage.services) ? landingPage.services : []),
      };

      const response = await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const updated = await response.json();
        
        // Parsear los campos JSON de manera segura
        let parsedFormFields = defaultFormFields;
        let parsedServices = [];
        
        try {
          parsedFormFields = updated.formFields ? JSON.parse(updated.formFields) : defaultFormFields;
        } catch (e) {
          console.error('Error parsing saved formFields:', e);
        }
        
        try {
          parsedServices = updated.services ? JSON.parse(updated.services) : [];
        } catch (e) {
          console.error('Error parsing saved services:', e);
        }
        
        setLandingPage({
          ...updated,
          formFields: Array.isArray(parsedFormFields) ? parsedFormFields : defaultFormFields,
          services: Array.isArray(parsedServices) ? parsedServices : [],
        });
        showSuccess('¡Landing page guardada!', 'Los cambios se han guardado exitosamente');
      } else {
        showError('Error al guardar', 'No se pudieron guardar los cambios');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      showError('Error al guardar', 'Ocurrió un error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const addFormField = (field: typeof availableFields[0]) => {
    setLandingPage(prev => ({
      ...prev,
      formFields: [...(Array.isArray(prev.formFields) ? prev.formFields : defaultFormFields), { ...field, required: false }]
    }));
  };

  const removeFormField = (index: number) => {
    setLandingPage(prev => ({
      ...prev,
      formFields: (Array.isArray(prev.formFields) ? prev.formFields : defaultFormFields).filter((_, i) => i !== index)
    }));
  };

  const updateFormField = (index: number, updates: Partial<FormField>) => {
    setLandingPage(prev => ({
      ...prev,
      formFields: (Array.isArray(prev.formFields) ? prev.formFields : defaultFormFields).map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  // Funciones para servicios
  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: ''
    };
    setLandingPage(prev => ({
      ...prev,
      services: [...(Array.isArray(prev.services) ? prev.services : []), newService]
    }));
  };

  const removeService = (id: string) => {
    setLandingPage(prev => ({
      ...prev,
      services: (Array.isArray(prev.services) ? prev.services : []).filter(service => service.id !== id)
    }));
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setLandingPage(prev => ({
      ...prev,
      services: (Array.isArray(prev.services) ? prev.services : []).map(service => 
        service.id === id ? { ...service, ...updates } : service
      )
    }));
  };

  // Función para upload de imagen
  const handleImageUpload = async (file: File) => {
    // Validaciones del lado del cliente
    if (!file) {
      showError('Archivo requerido', 'Por favor selecciona un archivo');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Tipo de archivo no válido', 'Solo se permiten archivos de imagen (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Archivo muy grande', 'La imagen no puede exceder 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Subiendo imagen...', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Resultado:', result);
        
        setLandingPage(prev => ({
          ...prev,
          profileImage: result.url
        }));
        showSuccess('¡Imagen subida!', 'La foto de perfil se ha subido exitosamente');
      } else {
        // Obtener el mensaje de error específico del servidor
        let errorMessage = 'Error desconocido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        console.error('Error del servidor:', errorMessage);
        showError('Error al subir imagen', errorMessage);
      }
    } catch (error) {
      console.error('Error de red al subir imagen:', error);
      showError('Error de conexión', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const getPreviewUrl = () => {
    if (landingPage.slug && landingPage.isPublished) {
      return `${window.location.origin}/p/${landingPage.slug}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mi Página Web</h1>
                <p className="text-sm text-gray-500">Configura tu landing page profesional</p>
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
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'info'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Layout className="h-4 w-4 mr-3" />
                Información Básica
              </button>
              
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'services'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Servicios
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'calendar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Calendario
              </button>
              
              <button
                onClick={() => setActiveTab('form')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4 mr-3" />
                Formulario de Contacto
              </button>
              
              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'contact'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Phone className="h-4 w-4 mr-3" />
                Datos de Contacto
              </button>
              
              <button
                onClick={() => setActiveTab('design')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'design'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Palette className="h-4 w-4 mr-3" />
                Diseño y Branding
              </button>
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
                    
                    {/* Foto de Perfil */}
                    <div className="border-b pb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Foto de Perfil</h3>
                      <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                          {landingPage.profileImage ? (
                            <img
                              src={landingPage.profileImage}
                              alt="Foto de perfil"
                              className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm">
                              <Upload className="h-4 w-4 mr-2" />
                              {landingPage.profileImage ? 'Cambiar foto' : 'Subir foto'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file);
                                }
                              }}
                            />
                          </label>
                          <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG hasta 5MB. Recomendado: 400x400px
                          </p>
                          {landingPage.profileImage && (
                            <button
                              onClick={() => setLandingPage(prev => ({ ...prev, profileImage: undefined }))}
                              className="mt-2 text-xs text-red-600 hover:text-red-500"
                            >
                              Eliminar foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Profesional *
                        </label>
                        <input
                          type="text"
                          value={landingPage.professionalName}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, professionalName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="Ej: Dr. Juan Pérez"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título/Especialidad *
                        </label>
                        <input
                          type="text"
                          value={landingPage.title}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="Ej: Nutricionista Clínico"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frase de Valor *
                      </label>
                      <input
                        type="text"
                        value={landingPage.tagline}
                        onChange={(e) => setLandingPage(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        placeholder="Ej: Transformo tu relación con la comida de manera saludable y sostenible"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción de Servicios *
                      </label>
                      <textarea
                        rows={4}
                        value={landingPage.description}
                        onChange={(e) => setLandingPage(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                        placeholder="Describe brevemente tus servicios y cómo ayudas a tus clientes..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Texto del Botón de Agendar
                        </label>
                        <input
                          type="text"
                          value={landingPage.buttonText}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, buttonText: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="Ej: Reservar Consulta"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="requirePayment"
                          checked={landingPage.requirePayment}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, requirePayment: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="requirePayment" className="ml-3 text-sm text-gray-700">
                          Requiere pago antes de agendar
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={landingPage.isPublished}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, isPublished: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPublished" className="ml-3 text-sm font-medium text-gray-700">
                          Página publicada (visible públicamente)
                        </label>
                      </div>
                      
                      {landingPage.slug && (
                        <div className="text-sm text-gray-500">
                          URL: /p/{landingPage.slug}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Servicios</h2>
                      <button
                        onClick={addService}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Servicio
                      </button>
                    </div>
                    
                    {(!Array.isArray(landingPage.services) || landingPage.services.length === 0) ? (
                      <div className="text-center py-12">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay servicios</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Agrega tus servicios para mostrarlos en tu página
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={addService}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar primer servicio
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(Array.isArray(landingPage.services) ? landingPage.services : []).map((service) => (
                          <div key={service.id} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Servicio *
                                  </label>
                                  <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => updateService(service.id, { name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                    placeholder="Ej: Consulta Nutricional"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción del Servicio *
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={service.description}
                                    onChange={(e) => updateService(service.id, { description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                    placeholder="Describe qué incluye este servicio, beneficios, duración, etc."
                                  />
                                </div>
                                
                                <div className="w-full md:w-1/3">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="h-4 w-4 inline mr-1" />
                                    Precio (solo números)
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="100"
                                      value={service.price.replace(/[^0-9]/g, '')}
                                      onChange={(e) => {
                                        const numericValue = e.target.value;
                                        const formattedPrice = numericValue ? `$${parseInt(numericValue).toLocaleString('es-CL')}` : '';
                                        updateService(service.id, { price: formattedPrice });
                                      }}
                                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                      placeholder="50000"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Solo números. Se formateará automáticamente (ej: $50.000)
                                  </p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => removeService(service.id)}
                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Configuración del Calendario</h2>
                    
                    <div className="space-y-6">
                      {/* Mostrar calendario */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showCalendar"
                          checked={landingPage.showCalendar}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, showCalendar: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showCalendar" className="ml-3 text-sm font-medium text-gray-700">
                          Mostrar calendario en la página pública
                        </label>
                      </div>
                      
                      {landingPage.showCalendar && (
                        <>
                          {/* Descripción del calendario */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descripción del Calendario
                            </label>
                            <input
                              type="text"
                              value={landingPage.calendarDescription || ''}
                              onChange={(e) => setLandingPage(prev => ({ ...prev, calendarDescription: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                              placeholder="Ej: Selecciona una fecha y hora disponible para agendar tu cita"
                            />
                          </div>

                          {/* Duración de citas */}
                          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center space-x-3 mb-4">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <h3 className="text-md font-medium text-gray-900">Duración de Citas</h3>
                            </div>
                            
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                Define cuánto tiempo duran tus consultas o sesiones
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[20, 30, 45, 60].map((duration) => (
                                  <button
                                    key={duration}
                                    onClick={() => setLandingPage(prev => ({ ...prev, appointmentDuration: duration }))}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      landingPage.appointmentDuration === duration
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                  >
                                    <div className="text-lg font-semibold">{duration}</div>
                                    <div className="text-xs">minutos</div>
                                  </button>
                                ))}
                              </div>

                              {/* Duración personalizada */}
                              <div className="pt-4 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Duración Personalizada
                                </label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="number"
                                    min="5"
                                    max="240"
                                    step="5"
                                    value={![20, 30, 45, 60].includes(landingPage.appointmentDuration) ? landingPage.appointmentDuration : ''}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 60;
                                      setLandingPage(prev => ({ ...prev, appointmentDuration: value }));
                                    }}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    placeholder="60"
                                  />
                                  <span className="text-sm text-gray-600">minutos</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Entre 5 y 240 minutos, en incrementos de 5
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tiempo intermedio/buffer */}
                          <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center space-x-3 mb-4">
                              <Plus className="h-5 w-5 text-orange-600" />
                              <h3 className="text-md font-medium text-gray-900">Tiempo Intermedio</h3>
                            </div>
                            
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                Tiempo automático que se agrega después de cada cita para preparación, descanso o limpieza
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[0, 5, 10, 15, 30].map((buffer) => (
                                  <button
                                    key={buffer}
                                    onClick={() => setLandingPage(prev => ({ ...prev, bufferTime: buffer }))}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      landingPage.bufferTime === buffer
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                  >
                                    <div className="text-lg font-semibold">
                                      {buffer === 0 ? 'Sin' : buffer}
                                    </div>
                                    <div className="text-xs">
                                      {buffer === 0 ? 'buffer' : 'min'}
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Buffer personalizado */}
                              <div className="pt-4 border-t border-orange-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Tiempo Personalizado
                                </label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max="120"
                                    step="5"
                                    value={![0, 5, 10, 15, 30].includes(landingPage.bufferTime) ? landingPage.bufferTime : ''}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      setLandingPage(prev => ({ ...prev, bufferTime: value }));
                                    }}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                                    placeholder="0"
                                  />
                                  <span className="text-sm text-gray-600">minutos</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Entre 0 y 120 minutos, en incrementos de 5
                                </p>
                              </div>

                              {/* Explicación del buffer */}
                              <div className="bg-white/50 rounded-lg p-4 border border-orange-200">
                                <h4 className="text-sm font-medium text-orange-800 mb-2">
                                  ¿Cómo funciona el tiempo intermedio?
                                </h4>
                                <ul className="text-sm text-orange-700 space-y-1">
                                  <li>• El cliente ve solo su cita ({landingPage.appointmentDuration} min)</li>
                                  <li>• Automáticamente se bloquean {landingPage.bufferTime} min adicionales</li>
                                  <li>• En tu calendario aparecen ambos períodos por separado</li>
                                  <li>• Te da tiempo para preparar la siguiente consulta</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Vista previa de configuración */}
                          <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                            <div className="flex items-center space-x-3 mb-4">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <h3 className="text-md font-medium text-gray-900">Vista Previa del Calendario</h3>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-2">
                              <p>• <strong>Duración por cita:</strong> {landingPage.appointmentDuration} minutos</p>
                              <p>• <strong>Tiempo intermedio:</strong> {landingPage.bufferTime} minutos {landingPage.bufferTime > 0 ? '(automático)' : '(sin buffer)'}</p>
                              <p>• <strong>Total por slot:</strong> {landingPage.appointmentDuration + landingPage.bufferTime} minutos</p>
                              <p>• <strong>Lo que ve el cliente:</strong> Solo su cita de {landingPage.appointmentDuration} minutos</p>
                              <p>• <strong>Lo que ves tú:</strong> Cita principal + tiempo intermedio separado</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'form' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Formulario de Agendamiento</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {(Array.isArray(landingPage.formFields) ? landingPage.formFields : defaultFormFields).map((field, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Campo</label>
                                                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateFormField(index, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                                              <select
                                value={field.type}
                                onChange={(e) => updateFormField(index, { type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                              >
                                <option value="text">Texto</option>
                                <option value="email">Email</option>
                                <option value="tel">Teléfono</option>
                                <option value="number">Número</option>
                                <option value="textarea">Área de texto</option>
                              </select>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFormField(index, { required: e.target.checked })}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">Obligatorio</label>
                            </div>
                          </div>
                          
                          {!['name', 'lastName', 'email'].includes(field.name) && (
                            <button
                              onClick={() => removeFormField(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Agregar Campo</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableFields
                          .filter(field => !(Array.isArray(landingPage.formFields) ? landingPage.formFields : defaultFormFields).some(f => f.name === field.name))
                          .map((field) => (
                            <button
                              key={field.name}
                              onClick={() => addFormField(field)}
                              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {field.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Datos de Contacto</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="h-4 w-4 inline mr-2" />
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={landingPage.whatsapp || ''}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, whatsapp: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="+56912345678"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Instagram className="h-4 w-4 inline mr-2" />
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={landingPage.instagram || ''}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, instagram: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="@tu_usuario"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email de Contacto
                        </label>
                        <input
                          type="email"
                          value={landingPage.contactEmail || ''}
                          onChange={(e) => setLandingPage(prev => ({ ...prev, contactEmail: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="contacto@tuservicio.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Diseño y Branding</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Esquema de Colores
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colorSchemes.map((scheme) => (
                          <button
                            key={scheme.id}
                            onClick={() => setLandingPage(prev => ({ ...prev, colorScheme: scheme.id }))}
                            className={`p-4 rounded-lg border-2 text-left ${
                              landingPage.colorScheme === scheme.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: scheme.secondary }}
                              />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {scheme.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 