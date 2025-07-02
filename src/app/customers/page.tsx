'use client';

import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useToast } from '@/components/ToastProvider';
import Navigation from '@/components/Navigation';
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, Calendar, UserIcon, MailIcon, PhoneIcon, CalendarIcon, Lock as LockIcon, Briefcase as BriefcaseIcon, X } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  _count: {
    appointments: number;
  };
}

interface CustomerDetail {
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

export default function CustomersPage() {
  const { user } = useAuthUser();
  const { showSuccess, showError } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Customer modal states
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCustomers();
        setShowForm(false);
        resetForm();
        showSuccess(
          editingCustomer ? '¡Cliente actualizado!' : '¡Cliente creado!',
          editingCustomer ? 'Los datos del cliente se han actualizado' : 'El cliente se ha agregado exitosamente'
        );
      } else {
        const error = await response.json();
        showError('Error al guardar', error.error || 'No se pudo guardar el cliente');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCustomers();
        showSuccess('¡Cliente eliminado!', 'El cliente se ha eliminado exitosamente');
      } else {
        const error = await response.json();
        showError('Error al eliminar', error.error || 'No se pudo eliminar el cliente');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

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

  const getCustomerStatus = (customer: CustomerDetail) => {
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra tu base de clientes
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Crear tu primer cliente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        <button
                          onClick={() => openCustomerDetails(customer.id)}
                          className="text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {customer.name}
                        </button>
                      </h3>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {customer._count.appointments} citas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                    Registrado: {new Date(customer.createdAt).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Citas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, customer) => sum + customer._count.appointments, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Email</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => customer.email).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Teléfono</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => customer.phone).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {renderCustomerModal()}
    </div>
  );
} 