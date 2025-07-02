'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon,
  MailIcon,
  BriefcaseIcon,
  LockIcon,
  EditIcon,
  X as XIcon,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail
} from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: string;
  notes?: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
  appointments?: Array<{
    id: string;
    date: string;
    duration: number;
    status: string;
    notes?: string;
    internalComment?: string;
    internalPrice?: number;
    publicPrice?: number;
  }>;
  totalIncome?: number;
  averageAppointmentsPerMonth?: number;
  lastAppointment?: string;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [highlightedAppointment, setHighlightedAppointment] = useState<string | null>(null);

  // Customer modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Reference for scrolling to highlighted appointment
  const appointmentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, viewMode]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments?period=month');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    // Usar zona horaria local para evitar problemas de conversión UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const aptYear = aptDate.getFullYear();
      const aptMonth = String(aptDate.getMonth() + 1).padStart(2, '0');
      const aptDay = String(aptDate.getDate()).padStart(2, '0');
      const aptDateStr = `${aptYear}-${aptMonth}-${aptDay}`;
      
      return aptDateStr === dateStr;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'COMPLETED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const openCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const customerData = await response.json();
        const customer = {
          ...customerData,
          totalIncome: calculateCustomerIncome(customerData.appointments || []),
          lastAppointment: getLastAppointmentDate(customerData.appointments || []),
          averageAppointmentsPerMonth: calculateAverageAppointments(customerData.appointments || [])
        };
        setSelectedCustomer(customer);
        setShowCustomerModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const openCustomerDetailsByName = async (customerName: string) => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        const customer = data.customers?.find((c: any) => c.name === customerName);
        if (customer) {
          await openCustomerDetails(customer.id);
        }
      }
    } catch (error) {
      console.error('Error finding customer by name:', error);
    }
  };

  const calculateCustomerIncome = (appointments: any[]) => {
    return appointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((total, apt) => total + (apt.publicPrice || apt.internalPrice || 45000), 0);
  };

  const getLastAppointmentDate = (appointments: any[]) => {
    if (appointments.length === 0) return null;
    const lastApt = appointments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return lastApt.date;
  };

  const calculateAverageAppointments = (appointments: any[]) => {
    if (appointments.length === 0) return 0;
    const firstAppointment = new Date(Math.min(...appointments.map(apt => new Date(apt.date).getTime())));
    const monthsSinceFirst = (Date.now() - firstAppointment.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.round(appointments.length / Math.max(monthsSinceFirst, 1) * 10) / 10;
  };

  const calculateServiceStats = (appointments: any[]) => {
    if (!appointments || appointments.length === 0) return [];

    const serviceGroups: { [key: string]: { count: number; totalAmount: number; price: number } } = {};
    let withoutService = { count: 0, totalAmount: 0 };

    appointments.forEach(appointment => {
      const price = appointment.publicPrice || appointment.internalPrice;
      
      if (price) {
        const key = `service_${price}`;
        if (!serviceGroups[key]) {
          serviceGroups[key] = { count: 0, totalAmount: 0, price };
        }
        serviceGroups[key].count += 1;
        serviceGroups[key].totalAmount += price;
      } else {
        withoutService.count += 1;
        withoutService.totalAmount += 0;
      }
    });

    const services = Object.values(serviceGroups)
      .sort((a, b) => b.price - a.price)
      .map(service => ({
        name: `Servicio ${formatCurrency(service.price)}`,
        count: service.count,
        totalAmount: service.totalAmount,
        avgPrice: service.price
      }));

    if (withoutService.count > 0) {
      services.push({
        name: 'Sin servicio definido',
        count: withoutService.count,
        totalAmount: withoutService.totalAmount,
        avgPrice: 0
      });
    }

    return services;
  };

  const getCustomerStatus = (customer: Customer) => {
    const appointmentCount = customer._count?.appointments || 0;
    const lastAppointment = customer.lastAppointment;
    
    if (appointmentCount === 0) {
      return { status: 'Nuevo', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (lastAppointment) {
      const daysSinceLastAppointment = Math.floor(
        (Date.now() - new Date(lastAppointment).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastAppointment <= 30) {
        return { status: 'Activo', color: 'bg-green-100 text-green-800' };
      } else if (daysSinceLastAppointment <= 90) {
        return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { status: 'Inactivo', color: 'bg-red-100 text-red-800' };
      }
    }
    
    return { status: 'Inactivo', color: 'bg-gray-100 text-gray-800' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const renderCustomerModal = () => {
    if (!selectedCustomer) return null;

    const customerStatus = getCustomerStatus(selectedCustomer);

    const handleCloseModal = () => {
      setShowCustomerModal(false);
      setSelectedCustomer(null);
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleCloseModal}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.name}
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerStatus.color}`}>
                    {customerStatus.status}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedCustomer.name}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center space-x-3">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Cliente desde {formatDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Citas</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer._count?.appointments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ingresos Totales</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedCustomer.totalIncome || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio Mensual</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer.averageAppointmentsPerMonth} citas/mes
                      </span>
                    </div>
                    {selectedCustomer.lastAppointment && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Última Cita</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(selectedCustomer.lastAppointment)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-medium text-gray-900">Servicios Contratados</h3>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const serviceStats = calculateServiceStats(selectedCustomer.appointments || []);
                      
                      if (serviceStats.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <div className="text-gray-400 text-sm">Sin servicios contratados</div>
                          </div>
                        );
                      }

                      return serviceStats.map((service, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-700">{service.name}</span>
                            <span className="text-xs text-gray-500">{service.count} cita{service.count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Total: {formatCurrency(service.totalAmount)}</span>
                            {service.avgPrice > 0 && (
                              <span>Precio: {formatCurrency(service.avgPrice)}</span>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Citas</h3>
                  {selectedCustomer.appointments && selectedCustomer.appointments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedCustomer.appointments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(appointment => (
                          <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(appointment.date)} - {formatTime(appointment.date)}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Duración: {appointment.duration} minutos</div>
                              {appointment.notes && (
                                <div><strong>Notas:</strong> {appointment.notes}</div>
                              )}
                              {appointment.internalComment && (
                                <div className="bg-yellow-50 p-2 rounded flex items-start space-x-1">
                                  <LockIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-yellow-800"><strong>Comentario interno:</strong> {appointment.internalComment}</span>
                                </div>
                              )}
                              {(appointment.publicPrice || appointment.internalPrice) && (
                                <div className="flex justify-between text-xs">
                                  {appointment.publicPrice && (
                                    <span><strong>Precio público:</strong> {formatCurrency(appointment.publicPrice)}</span>
                                  )}
                                  {appointment.internalPrice && appointment.internalPrice !== appointment.publicPrice && (
                                    <span className="text-yellow-700">
                                      <LockIcon className="h-3 w-3 inline mr-1" />
                                      <strong>Precio interno:</strong> {formatCurrency(appointment.internalPrice)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-sm">Sin historial de citas</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-7 gap-4">
            {DAYS.map(day => (
              <div key={day} className="text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="aspect-square"></div>;
              }
              
              const dayAppointments = getAppointmentsForDate(day);
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-300' : ''
                  } ${isTodayDate ? 'bg-blue-100 border-blue-400' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="h-full flex flex-col">
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDate ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="flex-1 space-y-1">
                      {dayAppointments.slice(0, 2).map(apt => (
                        <div
                          key={apt.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(apt.status)}`}
                          title={`${formatTime(apt.date)} - ${apt.customer.name}`}
                          onClick={(e) => handleAppointmentClick(apt.id, e)}
                        >
                          {formatTime(apt.date)}
                          <span className="ml-1 font-medium">
                            {apt.customer.name}
                          </span>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;
    
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Citas para {selectedDate.toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <Link
            href="/appointments"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Cita
          </Link>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas programadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes citas programadas para este día.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map(appointment => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-16 rounded-full ${getStatusColor(appointment.status)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <button
                          onClick={() => openCustomerDetailsByName(appointment.customer.name)}
                          className="font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {appointment.customer.name}
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatTime(appointment.date)} ({appointment.duration} min)</span>
                        </span>
                        
                        {appointment.customer.phone && (
                          <span className="flex items-center space-x-1">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{appointment.customer.phone}</span>
                          </span>
                        )}
                      </div>
                      
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get all appointments for the current month
  const getAppointmentsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getFullYear() === year && aptDate.getMonth() === month;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Handle clicking on an appointment in the calendar
  const handleAppointmentClick = (appointmentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent day selection
    setHighlightedAppointment(appointmentId);
    
    // Scroll to the appointment in the list
    setTimeout(() => {
      const element = document.getElementById(`appointment-${appointmentId}`);
      if (element && appointmentListRef.current) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Render the complete list of appointments for the month
  const renderMonthAppointmentsList = () => {
    const monthAppointments = getAppointmentsForMonth();
    
    if (monthAppointments.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Citas de {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas programadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes citas programadas para este mes.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Citas de {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {monthAppointments.length} citas programadas
          </p>
        </div>
        
        <div ref={appointmentListRef} className="max-h-96 overflow-y-auto p-6 space-y-4">
          {monthAppointments.map(appointment => (
            <div
              key={appointment.id}
              id={`appointment-${appointment.id}`}
              className={`border rounded-lg p-4 transition-all duration-300 ${
                highlightedAppointment === appointment.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-3 h-16 rounded-full ${getStatusColor(appointment.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => openCustomerDetailsByName(appointment.customer.name)}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {appointment.customer.name}
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString('es-CL', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatTime(appointment.date)} ({appointment.duration} min)</span>
                      </span>
                      
                      {appointment.customer.phone && (
                        <span className="flex items-center space-x-1">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{appointment.customer.phone}</span>
                        </span>
                      )}
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Notas:</strong> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get week dates for week view
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  // Get appointments for week
  const getAppointmentsForWeek = () => {
    const weekDates = getWeekDates(currentDate);
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });
  };

  // Get appointments for specific hour
  const getAppointmentsForHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      const aptHour = aptDate.getHours();
      return aptDateStr === dateStr && aptHour === hour;
    });
  };

  // Generate time slots (7 AM to 9 PM)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  // Navigate week
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  // Navigate day
  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -1 : 1;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const timeSlots = getTimeSlots();
    const weekAppointments = getAppointmentsForWeek();

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Week Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {weekDates[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} - {' '}
              {weekDates[6].toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            <div className="text-center text-sm font-medium text-gray-600 py-2"></div>
            {weekDates.map((date, index) => (
              <div key={index} className="text-center py-2">
                <div className="text-sm font-medium text-gray-600">
                  {DAYS[date.getDay()]}
                </div>
                <div className={`text-lg font-semibold mt-1 ${
                  isToday(date) ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week Grid */}
        <div className="max-h-96 overflow-y-auto">
          {weekAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos programados</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes citas programadas para esta semana.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-8 border-l border-gray-200">
              {/* Time column */}
              <div className="border-r border-gray-200">
                {timeSlots.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-100 flex items-center justify-end pr-3">
                    <span className="text-xs text-gray-500">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDates.map((date, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-200">
                  {timeSlots.map(hour => {
                    const hourAppointments = getAppointmentsForHour(date, hour);
                    return (
                      <div key={hour} className="h-16 border-b border-gray-100 p-1 relative">
                        {hourAppointments.map((apt, index) => (
                          <div
                            key={apt.id}
                            className={`text-xs px-2 py-1 rounded mb-1 text-white cursor-pointer hover:opacity-80 ${getStatusColor(apt.status)}`}
                            onClick={() => handleAppointmentClick(apt.id, {} as React.MouseEvent)}
                            title={`${apt.customer.name} - ${formatTime(apt.date)}`}
                          >
                            <div className="font-medium truncate">
                              {apt.customer.name}
                            </div>
                            <div className="truncate opacity-90">
                              {formatTime(apt.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Day Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDay('prev')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateDay('next')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Day Schedule */}
        <div className="max-h-96 overflow-y-auto">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos programados</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes citas programadas para este día.
              </p>
            </div>
          ) : (
            <div className="flex">
              {/* Time column */}
              <div className="w-20 border-r border-gray-200">
                {timeSlots.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-100 flex items-center justify-end pr-3">
                    <span className="text-sm text-gray-500">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Appointments column */}
              <div className="flex-1">
                {timeSlots.map(hour => {
                  const hourAppointments = getAppointmentsForHour(currentDate, hour);
                  return (
                    <div key={hour} className="h-16 border-b border-gray-100 p-2 relative">
                      {hourAppointments.map((apt, index) => (
                        <div
                          key={apt.id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-all ${
                            highlightedAppointment === apt.id
                              ? 'ring-2 ring-indigo-300 bg-indigo-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleAppointmentClick(apt.id, {} as React.MouseEvent)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(apt.status)}`}></div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCustomerDetailsByName(apt.customer.name);
                                  }}
                                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                                >
                                  {apt.customer.name}
                                </button>
                              </div>
                              
                              <div className="text-sm text-gray-500 mb-1">
                                <ClockIcon className="h-4 w-4 inline mr-1" />
                                {formatTime(apt.date)} ({apt.duration} min)
                              </div>
                              
                              {apt.customer.phone && (
                                <div className="text-sm text-gray-500">
                                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                                  {apt.customer.phone}
                                </div>
                              )}
                              
                              {apt.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notas:</strong> {apt.notes}
                                </p>
                              )}
                            </div>
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {getStatusText(apt.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-600 mt-1">Gestiona y visualiza todas tus citas</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hoy
            </button>
            
            <Link
              href="/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Cita
            </Link>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth('prev');
                else if (viewMode === 'week') navigateWeek('prev');
                else if (viewMode === 'day') navigateDay('prev');
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && (() => {
                const weekDates = getWeekDates(currentDate);
                return `${weekDates[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
              })()}
              {viewMode === 'day' && currentDate.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth('next');
                else if (viewMode === 'week') navigateWeek('next');
                else if (viewMode === 'day') navigateDay('next');
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* View Mode Selector */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === 'month'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } rounded-l-md`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                viewMode === 'week'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === 'day'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } rounded-r-md`}
            >
              Día
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Calendar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </div>
              
              <div>
                {renderSelectedDateDetails()}
              </div>
            </div>

            {/* Monthly Appointments List - only show in month view */}
            {viewMode === 'month' && (
              <div>
                {renderMonthAppointmentsList()}
              </div>
            )}
          </div>
        )}
      </div>

      {renderCustomerModal()}
    </div>
  );
} 