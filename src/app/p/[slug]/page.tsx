'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar,
  Phone, 
  Instagram, 
  Mail,
  User,
  MessageCircle,
  ExternalLink,
  Check
} from 'lucide-react';

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
  id: string;
  professionalName: string;
  title: string;
  tagline: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  logo?: string;
  services: string; // JSON string
  showCalendar: boolean;
  calendarDescription?: string;
  buttonText: string;
  requirePayment: boolean;
  formFields: string; // JSON string
  whatsapp?: string;
  instagram?: string;
  contactEmail?: string;
  colorScheme: string;
  slug: string;
  user: {
    name: string;
    email: string;
    clerkId: string;
  };
}

const colorSchemes = {
  blue: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1d4ed8' },
  green: { primary: '#16a34a', secondary: '#dcfce7', accent: '#15803d' },
  purple: { primary: '#9333ea', secondary: '#f3e8ff', accent: '#7c3aed' },
  orange: { primary: '#ea580c', secondary: '#fed7aa', accent: '#c2410c' },
};

export default function LandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchLandingPage();
  }, [slug]);

  useEffect(() => {
    if (landingPage && landingPage.showCalendar) {
      fetchAvailableSlots();
    }
  }, [landingPage]);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/public/landing/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLandingPage(data);
        
        // Inicializar formData con campos vacíos
        const initialFormData: Record<string, string> = {};
        const parsedFields = JSON.parse(data.formFields) as FormField[];
        parsedFields.forEach((field: FormField) => {
          initialFormData[field.name] = '';
        });
        setFormData(initialFormData);
      } else if (response.status === 404) {
        router.push('/404');
      }
    } catch (error) {
      console.error('Error al cargar landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!landingPage?.user.clerkId) return;
    
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/calendar/available-slots?professionalId=${landingPage.user.clerkId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableDays || []);
      }
    } catch (error) {
      console.error('Error al cargar slots disponibles:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simular envío de formulario y creación de cita
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real para crear la cita
      console.log('Datos del formulario:', formData);
      console.log('Slot seleccionado:', selectedSlot);
      console.log('Profesional:', landingPage?.user.email);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Error al enviar el formulario. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
          <p className="text-gray-600">La página que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  const colors = colorSchemes[landingPage.colorScheme as keyof typeof colorSchemes];
  const formFields = JSON.parse(landingPage.formFields) as FormField[];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: colors.secondary }}
          >
            <Check className="h-8 w-8" style={{ color: colors.primary }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Solicitud Enviada!</h1>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud de agendamiento. {landingPage.professionalName} se pondrá en contacto contigo pronto.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setShowForm(false);
              setFormData(prev => {
                const reset: Record<string, string> = {};
                Object.keys(prev).forEach(key => {
                  reset[key] = '';
                });
                return reset;
              });
            }}
            className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.primary }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-white to-gray-50 py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${colors.secondary} 0%, white 100%)` 
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {landingPage.profileImage && (
            <div className="mb-6">
              <img
                src={landingPage.profileImage}
                alt={landingPage.professionalName}
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
              />
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {landingPage.professionalName}
          </h1>
          
          <p 
            className="text-xl md:text-2xl font-medium mb-6"
            style={{ color: colors.primary }}
          >
            {landingPage.title}
          </p>
          
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {landingPage.tagline}
          </p>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: colors.primary }}
          >
            <Calendar className="h-5 w-5 mr-2" />
            {landingPage.buttonText}
          </button>
        </div>
      </div>

      {/* Descripción de Servicios */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sobre mis servicios
            </h2>
            <div className="prose prose-lg mx-auto text-gray-700">
              {landingPage.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      {(() => {
        const services = landingPage.services ? JSON.parse(landingPage.services) as Service[] : [];
        return services.length > 0 ? (
          <div className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
                Mis Servicios
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    {service.price && (
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: colors.primary }}
                        >
                          {service.price}
                        </span>
                        <button
                          onClick={() => setShowForm(true)}
                          className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Agendar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Contacto */}
      {(landingPage.whatsapp || landingPage.instagram || landingPage.contactEmail) && (
        <div className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              ¿Tienes preguntas? Contáctame
            </h2>
            
            <div className="flex justify-center space-x-8">
              {landingPage.whatsapp && (
                <a
                  href={`https://wa.me/${landingPage.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {landingPage.instagram && (
                <a
                  href={`https://instagram.com/${landingPage.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {landingPage.contactEmail && (
                <a
                  href={`mailto:${landingPage.contactEmail}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Agendar con {landingPage.professionalName}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Calendario */}
                {landingPage.showCalendar && (
                  <div className="border-b pb-6 mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      Selecciona fecha y hora
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {landingPage.calendarDescription || 'Selecciona una fecha y hora disponible para agendar tu cita'}
                    </p>
                    
                    {loadingSlots ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando horarios disponibles...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((day) => (
                            <div key={day.date} className="border border-gray-200 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-3 capitalize">
                                {day.dayName} - {new Date(day.date).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </h5>
                              {day.slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {day.slots.map((slot: any) => (
                                    <button
                                      key={slot.datetime}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`px-3 py-2 text-sm rounded-md border ${
                                        selectedSlot === slot.datetime
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      {slot.time}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No hay horarios disponibles</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              No hay horarios disponibles en los próximos días
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {formFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                                             <textarea
                         rows={3}
                         value={formData[field.name] || ''}
                         onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                         required={field.required}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                         placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                       />
                    ) : (
                                             <input
                         type={field.type}
                         value={formData[field.name] || ''}
                         onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                         required={field.required}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                         placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                       />
                    )}
                  </div>
                ))}
                
                {landingPage.requirePayment && (
                  <div 
                    className="p-4 rounded-lg border-l-4"
                    style={{ 
                      backgroundColor: colors.secondary,
                      borderColor: colors.primary 
                    }}
                  >
                    <p className="text-sm text-gray-700">
                      <strong>Nota:</strong> Se requiere pago antes de confirmar la cita.
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (landingPage.showCalendar && !selectedSlot)}
                    className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {submitting ? 'Enviando...' : 
                     (landingPage.showCalendar && !selectedSlot) ? 'Selecciona una hora' : 'Agendar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Página creada con MiAgendaOnline
          </p>
        </div>
      </footer>
    </div>
  );
} 