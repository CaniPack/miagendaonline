"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Import our new components and hooks
import {
  LoadingSpinner,
  EmptyState,
  PageHeader,
  ContentContainer,
  AppointmentCard,
} from "@/components/shared";
import {
  AppointmentModal,
  CustomerModal,
  useModal,
  BaseModal,
} from "@/components/shared/modals";
import {
  AppointmentForm,
} from "@/components/shared/forms";
import {
  useAppointments,
  useCustomers,
} from "@/hooks";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ToastProvider";

// Calendar utilities
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Time slots for calendar view (9 AM to 6 PM)
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return {
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    time: `${hour}:00`,
  };
});

export default function CalendarioPage() {
  const { showToast, showError, showSuccess } = useToast();
  
  // Use our new hooks
  const {
    appointments,
    loading: appointmentsLoading,
    createAppointment,
    updateAppointment,
    updateStatus,
    fetchAppointments,
  } = useAppointments();

  const {
    customers,
    loading: customersLoading,
    fetchCustomers,
  } = useCustomers();

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Modal management
  const appointmentModal = useModal();
  const customerModal = useModal();
  const appointmentFormModal = useModal();
  const appointmentViewModal = useModal();

  // Estados para datos de modals
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAppointments(),
          fetchCustomers()
        ]);
      } catch (error) {
        console.error('Error loading calendar data:', error);
        showToast({ title: 'Error al cargar los datos', type: 'error' });
      }
    };

    loadData();
  }, [fetchAppointments, fetchCustomers, showToast]);

  // Calendar utilities
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return formatDate(date1) === formatDate(date2);
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday before or on the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the last Saturday after or on the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, date) && 
             appointmentDate.getHours() === hour;
    });
  };

  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        navigateMonth(direction);
        break;
      case 'week':
        navigateWeek(direction);
        break;
      case 'day':
        navigateDay(direction);
        break;
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    }
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hour, 0, 0, 0);
    
    // Set the default data for new appointment
    setSelectedAppointment({
      date: appointmentDate.toISOString(),
      duration: 60,
    });
    appointmentFormModal.openModal();
  };

  const handleCreateAppointment = async (data: any) => {
    try {
      await createAppointment(data);
      showToast({ title: 'Cita creada exitosamente', type: 'success' });
      appointmentFormModal.closeModal();
    } catch (error) {
      console.error('Error creating appointment:', error);
      showToast({ title: 'Error al crear la cita', type: 'error' });
    }
  };

  const handleUpdateAppointment = async (id: string, data: any) => {
    try {
      await updateAppointment(id, data);
      showToast({ title: 'Cita actualizada exitosamente', type: 'success' });
      appointmentFormModal.closeModal();
    } catch (error) {
      console.error('Error updating appointment:', error);
      showToast({ title: 'Error al actualizar la cita', type: 'error' });
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: any) => {
    try {
      await updateStatus(appointmentId, newStatus);
      showToast({ title: 'Estado actualizado exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      showToast({ title: 'Error al actualizar el estado', type: 'error' });
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    appointmentFormModal.openModal();
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    appointmentViewModal.openModal();
  };

  // Get calendar data based on view mode
  const calendarDays = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return getMonthDays(currentDate);
      case 'week':
        return getWeekDays(currentDate);
      case 'day':
        return [currentDate];
      default:
        return getMonthDays(currentDate);
    }
  }, [currentDate, viewMode]);

  // Get header title
  const getHeaderTitle = () => {
    const monthName = MONTHS[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    switch (viewMode) {
      case 'month':
        return `${monthName} ${year}`;
      case 'week':
        const startOfWeek = getWeekDays(currentDate)[0];
        const endOfWeek = getWeekDays(currentDate)[6];
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${monthName} ${year}`;
        } else {
          return `${startOfWeek.getDate()} ${MONTHS[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${MONTHS[endOfWeek.getMonth()]} ${year}`;
        }
      case 'day':
        return `${currentDate.getDate()} ${monthName} ${year}`;
      default:
        return `${monthName} ${year}`;
    }
  };

  // Loading state
  if (appointmentsLoading || customersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <ContentContainer>
        {/* Mobile header */}
        <div className="md:hidden mb-6">
          <PageHeader
            title="Calendario"
            description="Visualiza y gestiona tus citas en el calendario"
          />
        </div>

        {/* Desktop header */}
        <div className="hidden md:block mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Calendario
                </h1>
                <p className="text-gray-600">Gestiona tu agenda de forma inteligente</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  appointmentFormModal.openModal();
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border p-4 md:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigation('prev')}
                  className="p-2 md:p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => handleNavigation('next')}
                  className="p-2 md:p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {getHeaderTitle()}
              </h2>

              <button
                onClick={goToToday}
                className="px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
              >
                Hoy
              </button>
            </div>

            {/* Right side - View controls */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 md:p-1.5">
                {(['month', 'week', 'day'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base rounded-lg md:rounded-xl transition-colors font-medium ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
                  </button>
                ))}
              </div>

              {viewMode === 'day' && (
                <button
                  onClick={() => setShowTimeSlots(!showTimeSlots)}
                  className={`px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base rounded-xl transition-colors font-medium flex items-center gap-2 ${
                    showTimeSlots
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Horarios
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  appointmentFormModal.openModal();
                }}
                className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-hidden">
          {viewMode === 'month' && (
            <>
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="p-3 md:p-5 text-center text-sm md:text-base font-semibold text-gray-700 bg-gray-50/80 md:bg-white border-r border-gray-100 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isSelected = isSameDay(date, selectedDate);

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`min-h-[120px] md:min-h-[140px] p-2 md:p-4 border-b border-r border-gray-100 last:border-r-0 cursor-pointer transition-all duration-200 ${
                        !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'hover:bg-gray-50/70'
                      } ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : ''} ${
                        isToday(date) ? 'bg-blue-50/70 ring-1 ring-blue-200' : ''
                      }`}
                    >
                      <div className={`text-sm md:text-base font-semibold mb-2 ${
                        isToday(date) ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1 md:space-y-2">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAppointment(appointment);
                            }}
                            className={`text-xs md:text-sm p-1.5 md:p-2 rounded-lg truncate cursor-pointer transition-colors shadow-sm ${
                              appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                              'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            <div className="font-medium">
                              {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="truncate">{appointment.customer.name}</div>
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs md:text-sm text-gray-500 text-center py-1 bg-gray-100 rounded-lg font-medium">
                            +{dayAppointments.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-8 min-h-[500px] md:min-h-[700px]">
              {/* Time column */}
              <div className="border-r border-gray-100 bg-gray-50/30">
                <div className="h-12 md:h-16 border-b border-gray-100"></div>
                {TIME_SLOTS.map((slot) => (
                  <div key={slot.hour} className="h-16 md:h-20 border-b border-gray-100 p-2 md:p-3 text-xs md:text-sm text-gray-600 font-medium">
                    {slot.label}
                  </div>
                ))}
              </div>

              {/* Week days */}
              {calendarDays.map((date, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-100 last:border-r-0">
                  {/* Day header */}
                  <div className={`h-12 md:h-16 border-b border-gray-100 p-2 md:p-3 text-center transition-colors ${
                    isToday(date) ? 'bg-blue-50/70' : 'hover:bg-gray-50/50'
                  }`}>
                    <div className="text-xs md:text-sm text-gray-600 font-medium">{DAYS_OF_WEEK[date.getDay()]}</div>
                    <div className={`text-base md:text-lg font-semibold ${
                      isToday(date) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Time slots */}
                  {TIME_SLOTS.map((slot) => {
                    const slotAppointments = getAppointmentsForTimeSlot(date, slot.hour);
                    
                    return (
                      <div
                        key={slot.hour}
                        onClick={() => handleTimeSlotClick(date, slot.hour)}
                        className="h-16 md:h-20 border-b border-gray-100 p-1 md:p-2 cursor-pointer hover:bg-gray-50/70 relative transition-colors"
                      >
                        {slotAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAppointment(appointment);
                            }}
                            className={`absolute inset-1 md:inset-2 text-xs md:text-sm p-1.5 md:p-2 rounded-lg cursor-pointer transition-colors shadow-sm ${
                              appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                              'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            <div className="font-semibold truncate">{appointment.customer.name}</div>
                            <div className="text-xs truncate opacity-75">{appointment.notes}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="p-4 md:p-8">
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {showTimeSlots ? (
                  /* Time slot view */
                  <div className="grid grid-cols-1 gap-2 md:gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const slotAppointments = getAppointmentsForTimeSlot(selectedDate, slot.hour);
                      
                      return (
                        <div
                          key={slot.hour}
                          onClick={() => handleTimeSlotClick(selectedDate, slot.hour)}
                          className="flex items-center p-4 md:p-6 border border-gray-100 rounded-xl md:rounded-2xl cursor-pointer hover:bg-gray-50/70 hover:border-gray-200 transition-all duration-200"
                        >
                          <div className="w-16 md:w-24 text-sm md:text-base font-semibold text-gray-700">
                            {slot.label}
                          </div>
                          <div className="flex-1 ml-4 md:ml-6">
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-2 md:space-y-3">
                                {slotAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAppointment(appointment);
                                    }}
                                    className={`p-3 md:p-4 rounded-xl cursor-pointer transition-colors shadow-sm ${
                                      appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                      appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                      'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    <div className="font-semibold text-sm md:text-base">{appointment.customer.name}</div>
                                    {appointment.notes && (
                                      <div className="text-xs md:text-sm mt-1 opacity-75">{appointment.notes}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm md:text-base text-gray-500 font-medium">Disponible</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List view */
                  <div>
                    {getAppointmentsForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-12 md:py-16">
                        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
                          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-gray-500" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay citas programadas</h4>
                          <p className="text-gray-600 mb-6">Este día está disponible para nuevas citas</p>
                          <button
                            onClick={() => {
                              setSelectedAppointment(null);
                              appointmentFormModal.openModal();
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                          >
                            Programar Cita
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                        {getAppointmentsForDate(selectedDate)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              onClick={() => handleEditAppointment(appointment)}
                              className="p-4 md:p-6 bg-white border border-gray-100 rounded-xl md:rounded-2xl cursor-pointer hover:bg-gray-50/70 hover:border-gray-200 transition-all duration-200 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    appointment.status === 'COMPLETED' ? 'bg-green-500' :
                                    appointment.status === 'CONFIRMED' ? 'bg-blue-500' :
                                    appointment.status === 'PENDING' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}></div>
                                  <span className="text-sm md:text-base font-semibold text-gray-900">
                                    {appointment.customer.name}
                                  </span>
                                </div>
                                <span className="text-sm md:text-base font-semibold text-gray-700">
                                  {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm md:text-base text-gray-600">{appointment.notes}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ContentContainer>

      {/* Modals */}
      
      {/* Appointment Form Modal (Create/Edit) */}
      <BaseModal
        isOpen={appointmentFormModal.isOpen}
        onClose={appointmentFormModal.closeModal}
        title={selectedAppointment?.id ? "Editar Cita" : "Nueva Cita"}
        size="lg"
      >
        <AppointmentForm
          appointment={selectedAppointment}
          customers={customers}
          onSubmit={selectedAppointment?.id ? 
            (data) => handleUpdateAppointment(selectedAppointment.id, data) :
            handleCreateAppointment
          }
          onCancel={appointmentFormModal.closeModal}
          mode={selectedAppointment?.id ? 'edit' : 'create'}
        />
      </BaseModal>

      {/* Appointment View Modal */}
      <AppointmentModal
        isOpen={appointmentViewModal.isOpen}
        onClose={appointmentViewModal.closeModal}
        appointment={selectedAppointment}
        onStatusChange={handleStatusUpdate}
        onEdit={(appointment) => {
          setSelectedAppointment(appointment);
          appointmentViewModal.closeModal();
          appointmentFormModal.openModal();
        }}
        onCustomerClick={(customerId) => {
          const customer = customers.find(c => c.id === customerId);
          if (customer) {
            setSelectedCustomer(customer);
            customerModal.openModal();
          }
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={customerModal.closeModal}
        customer={selectedCustomer}
      />
    </div>
  );
}
