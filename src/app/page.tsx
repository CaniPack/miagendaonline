"use client";

import Link from "next/link";
import { CalendarIcon, UserIcon, PlusIcon, CreditCardIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useState, useEffect } from "react";

// Import all our new components and hooks
import {
  StatsCard,
  AppointmentCard,
  CustomerCard,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  ContentContainer,
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
  useStats,
} from "@/hooks";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ToastProvider";

// Interface for landing page info (keeping minimal interfaces)
interface LandingPageInfo {
  slug?: string;
  isPublished?: boolean;
}

function UnauthenticatedHome() {
  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGetStarted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Agenda Online
          </h1>
          <p className="text-gray-600">
            Gestiona tus citas y clientes de manera profesional
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-left">
            <CalendarIcon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Programa y gestiona citas fácilmente</span>
          </div>
          <div className="flex items-center text-left">
            <UserIcon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Administra tu base de clientes</span>
          </div>
          <div className="flex items-center text-left">
            <CreditCardIcon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">Control de ingresos y pagos</span>
          </div>
        </div>

        {showGetStarted && (
          <div className="animate-fade-in">
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                Comenzar Ahora
              </button>
            </SignInButton>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthenticatedDashboard() {
  const { showToast, showError, showSuccess } = useToast();
  const user = useAuthUser();
  
  // Use our new hooks
  const { stats, loading: statsLoading } = useStats();
  const { 
    todayAppointments,
    loading: appointmentsLoading,
    fetchAppointments,
    updateStatus,
    createAppointment
  } = useAppointments();
  const { 
    customers,
    loading: customersLoading,
    fetchCustomers 
  } = useCustomers();
  
  // Simple state for search and pagination
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  
  // Modal management
  const appointmentModal = useModal();
  const customerModal = useModal();
  const appointmentFormModal = useModal();
  
  // Estados para datos de modals
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Pagination functions
  const prevAppointmentPage = () => {
    if (appointmentPage > 1) setAppointmentPage(appointmentPage - 1);
  };
  const nextAppointmentPage = () => {
    if (appointmentPage < appointmentTotalPages) setAppointmentPage(appointmentPage + 1);
  };
  const prevCustomerPage = () => {
    if (customerPage > 1) setCustomerPage(customerPage - 1);
  };
  const nextCustomerPage = () => {
    if (customerPage < customerTotalPages) setCustomerPage(customerPage + 1);
  };
  
  // Filter data based on search
  const filteredAppointments = todayAppointments.filter(apt => 
    apt.customer?.name?.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    apt.notes?.toLowerCase().includes(appointmentSearch.toLowerCase())
  );
  
  const filteredCustomers = customers.slice(0, 10).filter(customer => 
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  );
  
  // Pagination logic
  const appointmentsPerPage = 5;
  const customersPerPage = 5;
  const paginatedAppointments = filteredAppointments.slice(
    (appointmentPage - 1) * appointmentsPerPage,
    appointmentPage * appointmentsPerPage
  );
  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customersPerPage,
    customerPage * customersPerPage
  );
  
  const appointmentTotalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const customerTotalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Landing page state
  const [landingPageInfo, setLandingPageInfo] = useState<LandingPageInfo>({});
  const [loadingLanding, setLoadingLanding] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAppointments(),
          fetchCustomers()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error al cargar los datos');
      }
    };

    loadData();
  }, [fetchAppointments, fetchCustomers, showToast]);

  const fetchLandingPageInfo = async () => {
    try {
      setLoadingLanding(true);
      const response = await fetch('/api/landing-page');
      if (response.ok) {
        const data = await response.json();
        setLandingPageInfo(data || {});
      }
    } catch (error) {
      console.error('Error fetching landing page info:', error);
    } finally {
      setLoadingLanding(false);
    }
  };

  const handleViewPublicPage = () => {
    if (landingPageInfo.slug) {
      window.open(`/p/${landingPageInfo.slug}`, '_blank');
    } else {
      showError('No hay página pública configurada');
    }
  };

  const handleAppointmentStatusUpdate = async (appointmentId: string, newStatus: any) => {
    try {
      await updateStatus(appointmentId, newStatus);
      showSuccess('Estado de la cita actualizado exitosamente');
    } catch (error) {
      showError('Error al actualizar el estado de la cita');
    }
  };

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    customerModal.openModal();
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    appointmentModal.openModal();
  };

  // Modal event handlers for appointment form
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

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    appointmentFormModal.openModal();
  };

  // Loading state
  if (statsLoading || appointmentsLoading || customersLoading) {
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
          title={`¡Hola, Usuario! 👋`}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Citas de Hoy"
            value={stats?.appointmentsToday || 0}
            icon={CalendarIcon}
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Total Clientes"
            value={stats?.totalClients || 0}
            icon={UserIcon}
            color="green"
            loading={statsLoading}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={stats?.monthlyIncome || 0}
            icon={CreditCardIcon}
            color="purple"
            loading={statsLoading}
          />
          <StatsCard
            title="Citas Pendientes"
            value={stats?.pendingAppointments || 0}
            icon={CalendarIcon}
            color="orange"
            loading={statsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => {
              setSelectedAppointment(null);
              appointmentFormModal.openModal();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <div className="flex items-center justify-center">
              <PlusIcon className="w-5 h-5 mr-2 text-white" />
              Nueva Cita
            </div>
          </button>
          <Link href="/clientes">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
              <div className="flex items-center justify-center">
                <UserIcon className="w-5 h-5 mr-2 text-white" />
                Gestionar Clientes
              </div>
            </button>
          </Link>
          <Link href="/mi-pagina-web">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
              <div className="flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 mr-2 text-white" />
                Mi Página Web
              </div>
            </button>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Citas de Hoy</h2>
              <Link href="/appointments">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todas
                </button>
              </Link>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar citas..."
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {paginatedAppointments.length === 0 ? (
              <EmptyState
                title="No hay citas para hoy"
                description="¡Perfecto momento para relajarse o programar nuevas citas!"
              />
            ) : (
              <div className="space-y-3">
                {paginatedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => handleAppointmentClick(appointment)}

                  />
                ))}
                
                {/* Pagination */}
                {appointmentTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-4">
                    <button
                      onClick={prevAppointmentPage}
                      disabled={appointmentPage === 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {appointmentPage} de {appointmentTotalPages}
                    </span>
                    <button
                      onClick={nextAppointmentPage}
                      disabled={appointmentPage === appointmentTotalPages}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mejores Clientes</h2>
              <Link href="/clientes">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todos
                </button>
              </Link>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {paginatedCustomers.length === 0 ? (
              <EmptyState
                title="No hay clientes aún"
                description="Comienza agregando tu primer cliente"
              />
            ) : (
              <div className="space-y-3">
                {paginatedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onClick={() => handleCustomerClick(customer)}

                  />
                ))}
                
                {/* Pagination */}
                {customerTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-4">
                    <button
                      onClick={prevCustomerPage}
                      disabled={customerPage === 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {customerPage} de {customerTotalPages}
                    </span>
                    <button
                      onClick={nextCustomerPage}
                      disabled={customerPage === customerTotalPages}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Landing Page Section */}
        {!loadingLanding && (
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Tu Página Web Pública</h3>
                <p className="text-purple-100">
                  {landingPageInfo.isPublished 
                    ? "Tu página está publicada y lista para recibir clientes"
                    : "Configura tu página web para que los clientes puedan agendar citas"}
                </p>
              </div>
              <div className="flex space-x-3">
                {landingPageInfo.isPublished && landingPageInfo.slug && (
                  <button
                    onClick={handleViewPublicPage}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    Ver Página
                  </button>
                )}
                <Link href="/mi-pagina-web">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    Configurar
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
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
          onSubmit={handleCreateAppointment}
          onCancel={appointmentFormModal.closeModal}
          mode={selectedAppointment?.id ? 'edit' : 'create'}
        />
      </BaseModal>

      {/* Appointment View Modal */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={appointmentModal.closeModal}
        appointment={selectedAppointment}
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

export default function Home() {
  return (
    <>
      <SignedOut>
        <UnauthenticatedHome />
      </SignedOut>
      <SignedIn>
        <AuthenticatedDashboard />
      </SignedIn>
    </>
  );
}
