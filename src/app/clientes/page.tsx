'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { 
  UsersIcon, 
  SearchIcon,
  PlusIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  CreditCardIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UserIcon,
  EyeIcon,
  EditIcon,
  ClockIcon,
  Lock as LockIcon,
  BriefcaseIcon
} from 'lucide-react';
import Link from 'next/link';

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

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  averageAppointmentsPerCustomer: number;
  topCustomersByRevenue: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    appointmentCount: number;
  }>;
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerModalEditMode, setCustomerModalEditMode] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [appointmentFormData, setAppointmentFormData] = useState({
    status: '',
    notes: '',
    internalComment: '',
    internalPrice: '',
    publicPrice: ''
  });
  const [sortBy, setSortBy] = useState<'name' | 'appointments' | 'lastVisit' | 'revenue'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, sortBy, filterBy]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        const customersWithDetails = await Promise.all(
          (data.customers || []).map(async (customer: Customer) => {
            try {
              const appointmentsRes = await fetch(`/api/customers/${customer.id}`);
              if (appointmentsRes.ok) {
                const customerDetails = await appointmentsRes.json();
                return {
                  ...customer,
                  appointments: customerDetails.appointments || [],
                  totalIncome: calculateCustomerIncome(customerDetails.appointments || []),
                  lastAppointment: getLastAppointmentDate(customerDetails.appointments || []),
                  averageAppointmentsPerMonth: calculateAverageAppointments(customerDetails.appointments || [])
                };
              }
            } catch (error) {
              console.error(`Error fetching details for customer ${customer.id}:`, error);
            }
            return customer;
          })
        );
        setCustomers(customersWithDetails);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/customers?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateCustomerIncome = (appointments: any[]) => {
    return appointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((total, apt) => total + 45000, 0);
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

    // Agrupar citas por precio público (que representaría el servicio)
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
        // Si no hay precio definido, asumimos precio 0
        withoutService.totalAmount += 0;
      }
    });

    // Convertir a array ordenado por precio
    const services = Object.values(serviceGroups)
      .sort((a, b) => b.price - a.price)
      .map(service => ({
        name: `Servicio ${formatCurrency(service.price)}`,
        count: service.count,
        totalAmount: service.totalAmount,
        avgPrice: service.price
      }));

    // Agregar "sin servicio definido" si existen
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

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      );
    }

    if (filterBy === 'active') {
      filtered = filtered.filter(customer => {
        const lastApt = customer.lastAppointment;
        if (!lastApt) return false;
        const daysSinceLastApt = (Date.now() - new Date(lastApt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastApt <= 90;
      });
    } else if (filterBy === 'inactive') {
      filtered = filtered.filter(customer => {
        const lastApt = customer.lastAppointment;
        if (!lastApt) return true;
        const daysSinceLastApt = (Date.now() - new Date(lastApt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastApt > 90;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'appointments':
          return (b._count?.appointments || 0) - (a._count?.appointments || 0);
        case 'lastVisit':
          const aDate = a.lastAppointment ? new Date(a.lastAppointment).getTime() : 0;
          const bDate = b.lastAppointment ? new Date(b.lastAppointment).getTime() : 0;
          return bDate - aDate;
        case 'revenue':
          return (b.totalIncome || 0) - (a.totalIncome || 0);
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
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

  const getCustomerStatus = (customer: Customer) => {
    if (!customer.lastAppointment) return { status: 'Nuevo', color: 'bg-blue-100 text-blue-800' };
    
    const daysSinceLastApt = (Date.now() - new Date(customer.lastAppointment).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastApt <= 30) return { status: 'Activo', color: 'bg-green-100 text-green-800' };
    if (daysSinceLastApt <= 90) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Inactivo', color: 'bg-red-100 text-red-800' };
  };

  const openCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || ''
    });
    setCustomerModalEditMode(true);
    setShowCustomerModal(true);
  };

  // Función para inicializar el formulario cuando se abre el modal en modo edición
  const handleEditModeToggle = () => {
    if (!customerModalEditMode && selectedCustomer) {
      setCustomerFormData({
        name: selectedCustomer.name,
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || ''
      });
    }
    setCustomerModalEditMode(true);
  };

  const cancelEditCustomer = () => {
    setCustomerModalEditMode(false);
    setShowNewAppointmentForm(false);
    setCustomerFormData({
      name: '',
      email: '',
      phone: ''
    });
    setNewAppointmentData({
      date: '',
      time: '',
      duration: 60,
      notes: ''
    });
  };

  const saveCustomerChanges = async () => {
    if (!selectedCustomer) return;

    try {
      const payload = {
        name: customerFormData.name,
        email: customerFormData.email || null,
        phone: customerFormData.phone || null
      };

      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchCustomers();
        // Actualizar el cliente seleccionado
        const updatedCustomers = await Promise.all(
          customers.map(async (customer) => {
            if (customer.id === selectedCustomer?.id) {
              try {
                const appointmentsRes = await fetch(`/api/customers/${customer.id}`);
                if (appointmentsRes.ok) {
                  const customerDetails = await appointmentsRes.json();
                  return {
                    ...customer,
                    appointments: customerDetails.appointments || [],
                    totalIncome: calculateCustomerIncome(customerDetails.appointments || []),
                    lastAppointment: getLastAppointmentDate(customerDetails.appointments || []),
                    averageAppointmentsPerMonth: calculateAverageAppointments(customerDetails.appointments || [])
                  };
                }
              } catch (error) {
                console.error(`Error refreshing customer ${customer.id}:`, error);
              }
            }
            return customer;
          })
        );
        const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer?.id);
        if (updatedCustomer) {
          setSelectedCustomer({
            ...updatedCustomer, 
            name: payload.name,
            email: payload.email || undefined,
            phone: payload.phone || undefined
          });
        }
        
        setCustomerModalEditMode(false);
        alert('Cliente actualizado exitosamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error al actualizar el cliente');
    }
  };

  const createNewAppointment = async () => {
    if (!selectedCustomer || !newAppointmentData.date || !newAppointmentData.time) return;

    try {
      // Crear fecha en zona horaria local
      const [year, month, day] = newAppointmentData.date.split('-').map(Number);
      const [hours, minutes] = newAppointmentData.time.split(':').map(Number);
      const appointmentDate = new Date(year, month - 1, day, hours, minutes);

      const payload = {
        customerId: selectedCustomer.id,
        date: appointmentDate.toISOString(),
        duration: newAppointmentData.duration,
        notes: newAppointmentData.notes || null,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Refrescar datos del cliente
        await fetchCustomers();
        const appointmentsRes = await fetch(`/api/customers/${selectedCustomer.id}`);
        if (appointmentsRes.ok) {
          const customerDetails = await appointmentsRes.json();
          setSelectedCustomer({
            ...selectedCustomer,
            appointments: customerDetails.appointments || [],
            totalIncome: calculateCustomerIncome(customerDetails.appointments || []),
            lastAppointment: getLastAppointmentDate(customerDetails.appointments || []),
            averageAppointmentsPerMonth: calculateAverageAppointments(customerDetails.appointments || [])
          });
        }
        
        // Resetear formulario
        setNewAppointmentData({
          date: '',
          time: '',
          duration: 60,
          notes: ''
        });
        setShowNewAppointmentForm(false);
        alert('Cita creada exitosamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    }
  };

  const startEditingAppointment = (appointment: any) => {
    setEditingAppointment(appointment.id);
    setAppointmentFormData({
      status: appointment.status,
      notes: appointment.notes || '',
      internalComment: appointment.internalComment || '',
      internalPrice: appointment.internalPrice?.toString() || '',
      publicPrice: appointment.publicPrice?.toString() || ''
    });
  };

  const cancelEditingAppointment = () => {
    setEditingAppointment(null);
    setAppointmentFormData({
      status: '',
      notes: '',
      internalComment: '',
      internalPrice: '',
      publicPrice: ''
    });
  };

  const saveAppointmentChanges = async (appointmentId: string) => {
    try {
      const payload = {
        status: appointmentFormData.status,
        notes: appointmentFormData.notes,
        internalComment: appointmentFormData.internalComment,
        internalPrice: appointmentFormData.internalPrice ? parseInt(appointmentFormData.internalPrice) : null,
        publicPrice: appointmentFormData.publicPrice ? parseInt(appointmentFormData.publicPrice) : null
      };

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Refrescar la información del cliente
        await fetchCustomers();
        // Actualizar el cliente seleccionado
        const updatedCustomers = await Promise.all(
          customers.map(async (customer) => {
            if (customer.id === selectedCustomer?.id) {
              try {
                const appointmentsRes = await fetch(`/api/customers/${customer.id}`);
                if (appointmentsRes.ok) {
                  const customerDetails = await appointmentsRes.json();
                  return {
                    ...customer,
                    appointments: customerDetails.appointments || [],
                    totalIncome: calculateCustomerIncome(customerDetails.appointments || []),
                    lastAppointment: getLastAppointmentDate(customerDetails.appointments || []),
                    averageAppointmentsPerMonth: calculateAverageAppointments(customerDetails.appointments || [])
                  };
                }
              } catch (error) {
                console.error(`Error refreshing customer ${customer.id}:`, error);
              }
            }
            return customer;
          })
        );
        const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer?.id);
        if (updatedCustomer) {
          setSelectedCustomer(updatedCustomer);
        }
        
        cancelEditingAppointment();
        alert('Cita actualizada exitosamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar la cita');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar la cita');
    }
  };

  const renderCustomerModal = () => {
    if (!selectedCustomer) return null;

    const customerStatus = getCustomerStatus(selectedCustomer);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {customerModalEditMode ? 'Editando Cliente' : selectedCustomer.name}
                  </h2>
                  {!customerModalEditMode && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerStatus.color}`}>
                      {customerStatus.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {customerModalEditMode ? (
                  <>
                    <button
                      onClick={saveCustomerChanges}
                      disabled={!customerFormData.name.trim()}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEditCustomer}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditModeToggle}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                  >
                    <EditIcon className="h-4 w-4 inline mr-1" />
                    Editar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setCustomerModalEditMode(false);
                    cancelEditCustomer();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    {customerModalEditMode ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                          <input
                            type="text"
                            value={customerFormData.name}
                            onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={customerFormData.email}
                            onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                          <input
                            type="tel"
                            value={customerFormData.phone}
                            onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="+56 9 XXXX XXXX"
                          />
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
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

              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Historial de Citas</h3>
                        <p className="text-sm text-gray-500 mt-1">Haz clic en una cita para editarla</p>
                      </div>
                      {customerModalEditMode && (
                        <button
                          onClick={() => setShowNewAppointmentForm(true)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          <PlusIcon className="h-4 w-4 inline mr-1" />
                          Nueva Cita
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulario para nueva cita */}
                  {showNewAppointmentForm && (
                    <div className="p-4 border-b border-gray-200 bg-blue-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Crear Nueva Cita</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                          <input
                            type="date"
                            value={newAppointmentData.date}
                            onChange={(e) => setNewAppointmentData({...newAppointmentData, date: e.target.value})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Hora</label>
                          <input
                            type="time"
                            value={newAppointmentData.time}
                            onChange={(e) => setNewAppointmentData({...newAppointmentData, time: e.target.value})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                          <select
                            value={newAppointmentData.duration}
                            onChange={(e) => setNewAppointmentData({...newAppointmentData, duration: Number(e.target.value)})}
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value={30}>30 minutos</option>
                            <option value={60}>60 minutos</option>
                            <option value={90}>90 minutos</option>
                            <option value={120}>120 minutos</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                          <input
                            type="text"
                            value={newAppointmentData.notes}
                            onChange={(e) => setNewAppointmentData({...newAppointmentData, notes: e.target.value})}
                            placeholder="Notas opcionales..."
                            className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={createNewAppointment}
                          disabled={!newAppointmentData.date || !newAppointmentData.time}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-300"
                        >
                          Crear Cita
                        </button>
                        <button
                          onClick={() => {
                            setShowNewAppointmentForm(false);
                            setNewAppointmentData({ date: '', time: '', duration: 60, notes: '' });
                          }}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="max-h-96 overflow-y-auto">
                    {selectedCustomer.appointments && selectedCustomer.appointments.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {selectedCustomer.appointments
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(appointment => (
                          <div key={appointment.id} className="p-4 hover:bg-gray-50">
                            {editingAppointment === appointment.id ? (
                              // Formulario de edición
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-gray-900">Editando cita del {formatDate(appointment.date)}</h4>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => saveAppointmentChanges(appointment.id)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={cancelEditingAppointment}
                                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                      value={appointmentFormData.status}
                                      onChange={(e) => setAppointmentFormData({...appointmentFormData, status: e.target.value})}
                                      className="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                      <option value="PENDING">Pendiente</option>
                                      <option value="CONFIRMED">Confirmada</option>
                                      <option value="COMPLETED">Completada</option>
                                      <option value="CANCELLED">Cancelada</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Precio Público ($)</label>
                                    <input
                                      type="number"
                                      value={appointmentFormData.publicPrice}
                                      onChange={(e) => setAppointmentFormData({...appointmentFormData, publicPrice: e.target.value})}
                                      placeholder="45000"
                                      className="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Precio Interno ($)</label>
                                    <input
                                      type="number"
                                      value={appointmentFormData.internalPrice}
                                      onChange={(e) => setAppointmentFormData({...appointmentFormData, internalPrice: e.target.value})}
                                      placeholder="40000"
                                      className="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
                                    <div className="text-xs text-gray-600 py-1">{appointment.duration} minutos</div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Notas del Cliente</label>
                                  <textarea
                                    value={appointmentFormData.notes}
                                    onChange={(e) => setAppointmentFormData({...appointmentFormData, notes: e.target.value})}
                                    placeholder="Notas visibles para el cliente..."
                                    rows={2}
                                    className="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    <span className="flex items-center">
                                      <LockIcon className="h-3 w-3 mr-1" />
                                      Comentario Interno
                                    </span>
                                  </label>
                                  <textarea
                                    value={appointmentFormData.internalComment}
                                    onChange={(e) => setAppointmentFormData({...appointmentFormData, internalComment: e.target.value})}
                                    placeholder="Comentario privado solo para ti..."
                                    rows={2}
                                    className="w-full text-xs text-gray-900 bg-yellow-50 border border-gray-300 rounded px-2 py-1 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            ) : (
                              // Vista normal de la cita
                              <div 
                                className="cursor-pointer" 
                                onClick={() => startEditingAppointment(appointment)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      appointment.status === 'COMPLETED' ? 'bg-green-500' :
                                      appointment.status === 'CONFIRMED' ? 'bg-blue-500' :
                                      appointment.status === 'PENDING' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}></div>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-gray-900">
                                          {formatDate(appointment.date)}
                                        </p>
                                        {appointment.internalComment && (
                                          <div title="Tiene comentario interno">
                                            <LockIcon className="h-3 w-3 text-yellow-600" />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {appointment.duration} minutos
                                        {(appointment.publicPrice || appointment.internalPrice) && (
                                          <span className="ml-2">
                                            • {appointment.publicPrice ? formatCurrency(appointment.publicPrice) : 
                                                appointment.internalPrice ? `${formatCurrency(appointment.internalPrice)} (interno)` : ''}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {appointment.status === 'COMPLETED' ? 'Completada' :
                                       appointment.status === 'CONFIRMED' ? 'Confirmada' :
                                       appointment.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
                                    </span>
                                    <EditIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                </div>
                                
                                {appointment.notes && (
                                  <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Notas:</strong> {appointment.notes}
                                  </p>
                                )}
                                
                                {appointment.internalComment && (
                                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                                    <strong>Comentario interno:</strong> {appointment.internalComment}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin citas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Este cliente aún no tiene citas programadas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona tus clientes y su historial</p>
          </div>
          
          <Link
            href="/customers"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => getCustomerStatus(c).status === 'Activo').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Citas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + (c._count?.appointments || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + (c.totalIncome || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todos los clientes</option>
                <option value="active">Clientes activos</option>
                <option value="inactive">Clientes inactivos</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="appointments">Ordenar por citas</option>
                <option value="lastVisit">Ordenar por última visita</option>
                <option value="revenue">Ordenar por ingresos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando clientes...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no tienes clientes registrados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Citas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Cita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => {
                    const customerStatus = getCustomerStatus(customer);
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                Cliente desde {formatDate(customer.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.email && (
                              <div className="flex items-center space-x-1 mb-1">
                                <MailIcon className="h-3 w-3 text-gray-400" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-1">
                                <PhoneIcon className="h-3 w-3 text-gray-400" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{customer._count?.appointments || 0} citas</div>
                            <div className="text-gray-500">
                              {customer.averageAppointmentsPerMonth || 0} promedio/mes
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(customer.totalIncome || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.lastAppointment ? formatDate(customer.lastAppointment) : 'Nunca'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerStatus.color}`}>
                            {customerStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openCustomerDetails(customer)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditCustomer(customer)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCustomerModal && renderCustomerModal()}
    </div>
  );
} 