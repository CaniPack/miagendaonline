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
        <PageHeader
          title="Calendario"
          description="Visualiza y gestiona tus citas en el calendario"
        />

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigation('prev')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigation('next')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {getHeaderTitle()}
              </h2>

              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Hoy
              </button>
            </div>

            {/* Right side - View controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['month', 'week', 'day'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
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
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    showTimeSlots
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horarios
                </button>
              )}

              <button
                onClick={() => {
                  // Resetear cualquier selección anterior y abrir modal para nueva cita
                  setSelectedAppointment(null);
                  appointmentFormModal.openModal();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {viewMode === 'month' && (
            <>
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 bg-gray-50">
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
                      className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${isSelected ? 'bg-blue-50 border-blue-200' : ''} ${
                        isToday(date) ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday(date) ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAppointment(appointment);
                            }}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${
                              appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} {appointment.customer.name}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
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
            <div className="grid grid-cols-8 min-h-[600px]">
              {/* Time column */}
              <div className="border-r border-gray-200">
                <div className="h-16 border-b border-gray-200"></div>
                {TIME_SLOTS.map((slot) => (
                  <div key={slot.hour} className="h-16 border-b border-gray-200 p-2 text-xs text-gray-600">
                    {slot.label}
                  </div>
                ))}
              </div>

              {/* Week days */}
              {calendarDays.map((date, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                  {/* Day header */}
                  <div className={`h-16 border-b border-gray-200 p-2 text-center ${
                    isToday(date) ? 'bg-blue-50' : ''
                  }`}>
                    <div className="text-xs text-gray-600">{DAYS_OF_WEEK[date.getDay()]}</div>
                    <div className={`text-lg font-semibold ${
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
                        className="h-16 border-b border-gray-200 p-1 cursor-pointer hover:bg-gray-50 relative"
                      >
                        {slotAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAppointment(appointment);
                            }}
                            className={`absolute inset-1 text-xs p-1 rounded cursor-pointer ${
                              appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <div className="font-medium truncate">{appointment.customer.name}</div>
                            <div className="truncate">{appointment.notes}</div>
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
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {showTimeSlots ? (
                  /* Time slot view */
                  <div className="grid grid-cols-1 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const slotAppointments = getAppointmentsForTimeSlot(selectedDate, slot.hour);
                      
                      return (
                        <div
                          key={slot.hour}
                          onClick={() => handleTimeSlotClick(selectedDate, slot.hour)}
                          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="w-20 text-sm font-medium text-gray-600">
                            {slot.label}
                          </div>
                          <div className="flex-1 ml-4">
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-2">
                                {slotAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAppointment(appointment);
                                    }}
                                    className={`p-2 rounded cursor-pointer ${
                                      appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    <div className="font-medium">{appointment.customer.name}</div>
                                    <div className="text-sm">{appointment.notes}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">Disponible</div>
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
                      <EmptyState
                        title="No hay citas para este día"
                        description="Haz clic en 'Nueva Cita' para programar una cita"
                        actionLabel="Nueva Cita"
                        onAction={() => {
                          setSelectedAppointment(null);
                          appointmentFormModal.openModal();
                        }}
                      />
                    ) : (
                      <div className="space-y-3">
                        {getAppointmentsForDate(selectedDate)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onClick={() => handleEditAppointment(appointment)}
                            />
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
