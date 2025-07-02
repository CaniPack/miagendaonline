'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { 
  CreditCardIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  UserIcon,
  DollarSignIcon,
  BarChartIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  FilterIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  LockIcon,
  EditIcon
} from 'lucide-react';
import Link from 'next/link';

interface IncomeData {
  totalThisMonth: number;
  totalLastMonth: number;
  totalThisYear: number;
  completedAppointments: number;
  pendingAppointments: number;
  futureAppointments: number;
  monthlyAverage: number;
  growth: number;
}

interface AppointmentIncome {
  id: string;
  date: string;
  duration: number;
  status: string;
  notes?: string;
  income: number;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface ClientMetrics {
  id: string;
  name: string;
  totalIncome: number;
  appointmentCount: number;
  averagePerAppointment: number;
  lastAppointment: string;
  averageAppointmentsPerMonth: number;
  growthTrend: 'up' | 'down' | 'stable';
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

const APPOINTMENT_PRICE = 45000; // Base price per appointment

export default function IngresosPage() {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentIncome[]>([]);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [viewMode, setViewMode] = useState<'overview' | 'history' | 'clients' | 'projections'>('overview');
  const [sortBy, setSortBy] = useState<'date' | 'income' | 'client'>('date');

  // Customer modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchIncomeData();
    fetchAppointments();
    fetchClientMetrics();
  }, [selectedPeriod]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments for different periods
      const [thisMonthRes, lastMonthRes, thisYearRes] = await Promise.all([
        fetch('/api/appointments?period=month'),
        fetch('/api/appointments?period=lastMonth'),
        fetch('/api/appointments?period=year')
      ]);

      const [thisMonthData, lastMonthData, thisYearData] = await Promise.all([
        thisMonthRes.json(),
        lastMonthRes.json(),
        thisYearRes.json()
      ]);

      const thisMonthCompleted = (thisMonthData.appointments || []).filter((apt: any) => apt.status === 'COMPLETED');
      const lastMonthCompleted = (lastMonthData.appointments || []).filter((apt: any) => apt.status === 'COMPLETED');
      const thisYearCompleted = (thisYearData.appointments || []).filter((apt: any) => apt.status === 'COMPLETED');
      
      const thisMonthIncome = thisMonthCompleted.length * APPOINTMENT_PRICE;
      const lastMonthIncome = lastMonthCompleted.length * APPOINTMENT_PRICE;
      const thisYearIncome = thisYearCompleted.length * APPOINTMENT_PRICE;

      const pendingAppointments = (thisMonthData.appointments || []).filter((apt: any) => 
        apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      ).length;

      // Calculate future appointments (next 30 days)
      const futureRes = await fetch('/api/appointments?period=future');
      const futureData = await futureRes.json();
      const futureAppointments = (futureData.appointments || []).length;

      const growth = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
      const monthlyAverage = thisYearIncome / 12;

      setIncomeData({
        totalThisMonth: thisMonthIncome,
        totalLastMonth: lastMonthIncome,
        totalThisYear: thisYearIncome,
        completedAppointments: thisMonthCompleted.length,
        pendingAppointments,
        futureAppointments,
        monthlyAverage,
        growth
      });
    } catch (error) {
      console.error('Error fetching income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        const appointmentsWithIncome = (data.appointments || []).map((apt: any) => ({
          ...apt,
          income: apt.status === 'COMPLETED' ? APPOINTMENT_PRICE : 
                  apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? APPOINTMENT_PRICE : 0
        }));
        setAppointments(appointmentsWithIncome);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchClientMetrics = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        
        const metricsPromises = (data.customers || []).map(async (customer: any) => {
          try {
            const customerRes = await fetch(`/api/customers/${customer.id}`);
            if (customerRes.ok) {
              const customerData = await customerRes.json();
              const completedAppointments = (customerData.appointments || []).filter((apt: any) => apt.status === 'COMPLETED');
              const totalIncome = completedAppointments.length * APPOINTMENT_PRICE;
              
              const appointmentDates = (customerData.appointments || []).map((apt: any) => new Date(apt.date));
              const firstAppointment = Math.min(...appointmentDates.map((d: Date) => d.getTime()));
              const monthsSinceFirst = (Date.now() - firstAppointment) / (1000 * 60 * 60 * 24 * 30);
              const averagePerMonth = Math.max(monthsSinceFirst, 1) > 0 ? customerData.appointments.length / Math.max(monthsSinceFirst, 1) : 0;
              
              // Calculate growth trend (comparing last 3 months vs previous 3 months)
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              
              const recent = (customerData.appointments || []).filter((apt: any) => new Date(apt.date) >= threeMonthsAgo).length;
              const previous = (customerData.appointments || []).filter((apt: any) => {
                const aptDate = new Date(apt.date);
                return aptDate >= sixMonthsAgo && aptDate < threeMonthsAgo;
              }).length;
              
              let growthTrend: 'up' | 'down' | 'stable' = 'stable';
              if (recent > previous) growthTrend = 'up';
              else if (recent < previous) growthTrend = 'down';
              
              return {
                id: customer.id,
                name: customer.name,
                totalIncome,
                appointmentCount: customerData.appointments?.length || 0,
                averagePerAppointment: totalIncome / Math.max(completedAppointments.length, 1),
                lastAppointment: customerData.appointments?.length > 0 ? 
                  customerData.appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : '',
                averageAppointmentsPerMonth: Math.round(averagePerMonth * 10) / 10,
                growthTrend
              };
            }
          } catch (error) {
            console.error(`Error processing customer ${customer.id}:`, error);
          }
          return null;
        });
        
        const metrics = (await Promise.all(metricsPromises)).filter(Boolean) as ClientMetrics[];
        setClientMetrics(metrics.sort((a, b) => b.totalIncome - a.totalIncome));
      }
    } catch (error) {
      console.error('Error fetching client metrics:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const getSortedAppointments = () => {
    const sorted = [...appointments];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'income':
        return sorted.sort((a, b) => b.income - a.income);
      case 'client':
        return sorted.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
      default:
        return sorted;
    }
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomeData ? formatCurrency(incomeData.totalThisMonth) : '...'}
              </p>
              {incomeData && (
                <div className={`flex items-center mt-1 ${incomeData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeData.growth >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                  <span className="text-sm font-medium ml-1">
                    {Math.abs(incomeData.growth).toFixed(1)}% vs mes anterior
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Mensual</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomeData ? formatCurrency(incomeData.monthlyAverage) : '...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Basado en este año</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Completadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomeData ? incomeData.completedAppointments : '...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Este mes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Proyectados</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomeData ? formatCurrency((incomeData.pendingAppointments + incomeData.futureAppointments) * APPOINTMENT_PRICE) : '...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {incomeData ? `${incomeData.pendingAppointments + incomeData.futureAppointments} citas programadas` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients by Revenue */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Clientes por Ingresos</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {clientMetrics.slice(0, 5).map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <button
                      onClick={() => openCustomerDetails(client.id)}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {client.name}
                    </button>
                    <p className="text-sm text-gray-500">
                      {client.appointmentCount} citas • {client.averageAppointmentsPerMonth} promedio/mes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(client.totalIncome)}</p>
                  <div className="flex items-center mt-1">
                    {client.growthTrend === 'up' && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
                    {client.growthTrend === 'down' && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
                    <span className={`text-sm ml-1 ${
                      client.growthTrend === 'up' ? 'text-green-600' :
                      client.growthTrend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {client.growthTrend === 'up' ? 'Creciendo' :
                       client.growthTrend === 'down' ? 'Decreciendo' : 'Estable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Historial de Ingresos</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="income">Ordenar por ingreso</option>
            <option value="client">Ordenar por cliente</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ingreso
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedAppointments().map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDateTime(appointment.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openCustomerDetailsByName(appointment.customer.name)}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {appointment.customer.name}
                  </button>
                  {appointment.customer.phone && (
                    <div className="text-sm text-gray-500">{appointment.customer.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appointment.duration} min</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    appointment.status === 'COMPLETED' ? 'text-green-600' :
                    appointment.status === 'CONFIRMED' || appointment.status === 'PENDING' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {appointment.status === 'CANCELLED' ? '-' : formatCurrency(appointment.income)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Análisis por Cliente</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Citas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promedio/Mes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Ingresos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Cita
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tendencia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientMetrics.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openCustomerDetails(client.id)}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {client.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.appointmentCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.averageAppointmentsPerMonth}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(client.totalIncome)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {client.lastAppointment ? formatDate(client.lastAppointment) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {client.growthTrend === 'up' && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
                    {client.growthTrend === 'down' && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
                    <span className={`text-sm ml-1 ${
                      client.growthTrend === 'up' ? 'text-green-600' :
                      client.growthTrend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {client.growthTrend === 'up' ? 'Creciendo' :
                       client.growthTrend === 'down' ? 'Decreciendo' : 'Estable'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ingresos</h1>
            <p className="text-gray-600 mt-1">Análisis financiero y métricas de rendimiento</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'overview', label: 'Resumen', icon: BarChartIcon },
            { key: 'history', label: 'Historial', icon: ClockIcon },
            { key: 'clients', label: 'Por Cliente', icon: UserIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as any)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {viewMode === 'overview' && renderOverview()}
            {viewMode === 'history' && renderHistory()}
            {viewMode === 'clients' && renderClients()}
          </>
        )}
      </div>
      
      {renderCustomerModal()}
    </div>
  );
} 