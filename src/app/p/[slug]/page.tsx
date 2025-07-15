"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/components/ToastProvider";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Phone,
  Instagram,
  Mail,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";

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
  duration?: number; // Duración específica del servicio en minutos (opcional)
  bufferTime?: number; // Tiempo intermedio específico en minutos (opcional)
}

interface TimeSlot {
  datetime: string;
  time: string;
}

interface AvailableDay {
  date: string;
  slots: TimeSlot[];
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
  blue: { primary: "#2563eb", secondary: "#dbeafe", accent: "#1d4ed8" },
  green: { primary: "#16a34a", secondary: "#dcfce7", accent: "#15803d" },
  purple: { primary: "#9333ea", secondary: "#f3e8ff", accent: "#7c3aed" },
  orange: { primary: "#ea580c", secondary: "#fed7aa", accent: "#c2410c" },
  pink: { primary: "#ec4899", secondary: "#fce7f3", accent: "#db2777" },
};

export default function LandingPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();
  const slug = params.slug as string;

  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Estados para el calendario elegante
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchLandingPage();
  }, [slug]);

  useEffect(() => {
    if (landingPage && landingPage.showCalendar) {
      fetchAvailableSlots();
    }
  }, [landingPage]);

  // Refrescar slots cuando cambie el servicio seleccionado
  useEffect(() => {
    if (landingPage && landingPage.showCalendar && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedService]);

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
          initialFormData[field.name] = "";
        });
        setFormData(initialFormData);
      } else if (response.status === 404) {
        router.push("/404");
      }
    } catch (error) {
      console.error("Error al cargar landing page:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!landingPage?.user.clerkId) return;

    setLoadingSlots(true);
    try {
      let url = `/api/calendar/available-slots?professionalId=${landingPage.user.clerkId}`;

      // Agregar serviceId si hay un servicio seleccionado
      if (selectedService?.id) {
        url += `&serviceId=${selectedService.id}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableDays || []);
      }
    } catch (error) {
      console.error("Error al cargar slots disponibles:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Funciones para el calendario elegante
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días vacíos al principio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    setCurrentCalendarDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return availableSlots.some(
      (slot) => slot.date === dateStr && slot.slots.length > 0
    );
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date: Date) => {
    if (isDatePast(date)) return;

    setSelectedDate(date);
    setSelectedTime(null);

    // Actualizar selectedSlot para compatibilidad
    const dateStr = date.toISOString().split("T")[0];
    const daySlot = availableSlots.find((slot) => slot.date === dateStr);
    if (daySlot && daySlot.slots.length > 0) {
      // No seleccionar automáticamente, dejar que el usuario elija
      setSelectedSlot(null);
    }
  };

  const getTimeSlotsForSelectedDate = () => {
    if (!selectedDate) return [];

    const dateStr = selectedDate.toISOString().split("T")[0];
    const daySlot = availableSlots.find((slot) => slot.date === dateStr);
    return daySlot?.slots || [];
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot.time);
    setSelectedSlot(slot.datetime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar que se haya seleccionado fecha y hora
      if (!selectedDate || !selectedTime) {
        showError(
          "Selecciona fecha y hora",
          "Por favor selecciona una fecha y hora disponible"
        );
        return;
      }

      // Validar campos requeridos
      const requiredFields = formFields.filter((field) => field.required);
      const missingFields = requiredFields.filter(
        (field) => !formData[field.name]
      );

      if (missingFields.length > 0) {
        showError(
          "Campos requeridos",
          `Por favor completa: ${missingFields.map((f) => f.label).join(", ")}`
        );
        return;
      }

      // Crear la cita
      const response = await fetch("/api/public/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professionalClerkId: landingPage?.user.clerkId,
          formData,
          selectedDate: selectedDate.toISOString().split("T")[0],
          selectedTime: selectedTime,
          selectedService: selectedService,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la cita");
      }

      console.log("Cita creada exitosamente:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      showError(
        "Error al enviar formulario",
        error instanceof Error ? error.message : "Por favor intenta nuevamente"
      );
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h1>
          <p className="text-gray-600">
            La página que buscas no existe o no está disponible.
          </p>
        </div>
      </div>
    );
  }

  const colors =
    colorSchemes[landingPage.colorScheme as keyof typeof colorSchemes];
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Solicitud Enviada!
          </h1>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud de agendamiento.{" "}
            {landingPage.professionalName} se pondrá en contacto contigo pronto.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setShowForm(false);
              setFormData((prev) => {
                const reset: Record<string, string> = {};
                Object.keys(prev).forEach((key) => {
                  reset[key] = "";
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
          background: `linear-gradient(135deg, ${colors.secondary} 0%, white 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {landingPage.profileImage && (
            <div className="mb-6">
              <Image
                src={landingPage.profileImage}
                alt={landingPage.professionalName}
                width={96}
                height={96}
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
              {landingPage.description.split("\n").map((paragraph, index) => (
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
        const services = landingPage.services
          ? (JSON.parse(landingPage.services) as Service[])
          : [];
        return services.length > 0 ? (
          <div className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
                Mis Servicios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
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
                          onClick={() => {
                            setSelectedService(service);
                            setShowForm(true);
                          }}
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
      {(landingPage.whatsapp ||
        landingPage.instagram ||
        landingPage.contactEmail) && (
        <div className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              ¿Tienes preguntas? Contáctame
            </h2>

            <div className="flex justify-center space-x-8">
              {landingPage.whatsapp && (
                <a
                  href={`https://wa.me/${landingPage.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
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
                  href={`https://instagram.com/${landingPage.instagram.replace(
                    "@",
                    ""
                  )}`}
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

      {/* Modal de Formulario Elegante */}
      {showForm && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Agendar con {landingPage.professionalName}
                  </h3>
                  {selectedService ? (
                    <div className="mt-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <span className="font-medium">
                          {selectedService.name}
                        </span>
                        {selectedService.price && (
                          <span className="ml-2 text-blue-600">
                            {selectedService.price}
                          </span>
                        )}
                        {(selectedService.duration ||
                          selectedService.bufferTime) && (
                          <span className="ml-2 text-blue-600">
                            ({selectedService.duration || 60} min)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedService(null);
                          fetchAvailableSlots(); // Refrescar con configuración general
                        }}
                        className="ml-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Cambiar servicio
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-1">
                      {landingPage.calendarDescription ||
                        "Selecciona una fecha y hora disponible para agendar tu cita"}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedService(null); // Limpiar servicio seleccionado al cerrar
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <form onSubmit={handleSubmit}>
                {/* Calendario */}
                {landingPage.showCalendar && (
                  <div className="p-8">
                    {loadingSlots ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                          Cargando horarios disponibles...
                        </p>
                      </div>
                    ) : (
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Calendario Visual */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              Selecciona una fecha
                            </h4>
                            <p className="text-sm text-gray-600">
                              Los días con disponibilidad aparecen resaltados
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-6">
                            {/* Header del calendario */}
                            <div className="flex items-center justify-between mb-6">
                              <h5 className="text-lg font-semibold text-gray-900 capitalize">
                                {currentCalendarDate.toLocaleDateString(
                                  "es-ES",
                                  {
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </h5>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => navigateCalendar("prev")}
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigateCalendar("next")}
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  <ChevronRight className="h-5 w-5 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                              {[
                                "Dom",
                                "Lun",
                                "Mar",
                                "Mié",
                                "Jue",
                                "Vie",
                                "Sáb",
                              ].map((day) => (
                                <div
                                  key={day}
                                  className="text-center text-sm font-medium text-gray-500 py-2"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Días del mes */}
                            <div className="grid grid-cols-7 gap-1">
                              {getDaysInMonth(currentCalendarDate).map(
                                (date, index) => {
                                  if (!date) {
                                    return (
                                      <div
                                        key={`empty-${index}`}
                                        className="h-10"
                                      ></div>
                                    );
                                  }

                                  const isAvailable = isDateAvailable(date);
                                  const isSelected = isDateSelected(date);
                                  const isToday = isDateToday(date);
                                  const isPast = isDatePast(date);

                                  return (
                                    <button
                                      key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                                      type="button"
                                      onClick={() => handleDateSelect(date)}
                                      disabled={isPast || !isAvailable}
                                      className={`
                                      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                                      ${
                                        isSelected
                                          ? "bg-blue-600 text-white shadow-lg transform scale-105"
                                          : isAvailable && !isPast
                                          ? "bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-blue-200"
                                          : isPast
                                          ? "text-gray-300 cursor-not-allowed"
                                          : "text-gray-400 cursor-not-allowed"
                                      }
                                      ${
                                        isToday && !isSelected
                                          ? "ring-2 ring-blue-600 ring-opacity-50"
                                          : ""
                                      }
                                      ${
                                        isAvailable && !isPast
                                          ? "hover:shadow-md"
                                          : ""
                                      }
                                    `}
                                    >
                                      {date.getDate()}
                                      {isAvailable && !isPast && (
                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                                      )}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selección de horarios */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                              <Clock className="h-5 w-5 mr-2 text-gray-600" />
                              Horarios disponibles
                            </h4>
                            {selectedDate && (
                              <p className="text-sm text-gray-600">
                                {selectedDate.toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </p>
                            )}
                          </div>

                          {selectedDate ? (
                            <div className="bg-gray-50 rounded-xl p-6">
                              {getTimeSlotsForSelectedDate().length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {getTimeSlotsForSelectedDate().map(
                                    (slot: TimeSlot) => (
                                      <button
                                        key={slot.datetime}
                                        type="button"
                                        onClick={() => handleTimeSelect(slot)}
                                        className={`
                                        px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200
                                        ${
                                          selectedTime === slot.time
                                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg transform scale-105"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                                        }
                                      `}
                                      >
                                        {slot.time}
                                      </button>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                  <p className="text-gray-500">
                                    No hay horarios disponibles para esta fecha
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                              <p className="text-gray-500">
                                Selecciona una fecha para ver los horarios
                                disponibles
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Formulario */}
                <div className="px-8 pb-8">
                  <div className="border-t border-gray-200 pt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">
                      Tus datos
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      {formFields.map((field) => (
                        <div
                          key={field.name}
                          className={
                            field.type === "textarea" ? "md:col-span-2" : ""
                          }
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>

                          {field.type === "textarea" ? (
                            <textarea
                              rows={4}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))
                              }
                              required={field.required}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors"
                              placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))
                              }
                              required={field.required}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors"
                              placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {landingPage.requirePayment && (
                      <div
                        className="mt-6 p-4 rounded-xl border-l-4"
                        style={{
                          backgroundColor: colors.secondary,
                          borderColor: colors.primary,
                        }}
                      >
                        <p className="text-sm text-gray-700">
                          <strong>Nota:</strong> Se requiere pago antes de
                          confirmar la cita.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        (landingPage.showCalendar && !selectedSlot)
                      }
                      className="flex-1 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </span>
                      ) : landingPage.showCalendar && !selectedSlot ? (
                        "Selecciona fecha y hora"
                      ) : (
                        "Confirmar cita"
                      )}
                    </button>
                  </div>
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
