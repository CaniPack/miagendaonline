"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Plus, Filter, Search } from "lucide-react";

// Import our new components and hooks
import {
  StatsCard,
  AppointmentCard,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  ContentContainer,
} from "@/components/shared";
import {
  AppointmentModal,
  CustomerModal,
  ConfirmModal,
  useModal,
  BaseModal,
} from "@/components/shared/modals";
import {
  CustomerForm,
  AppointmentForm,
} from "@/components/shared/forms";
import {
  useAppointments,
  useCustomers,
} from "@/hooks";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ToastProvider";

const APPOINTMENTS_PER_PAGE = 10;

export default function AppointmentsPage() {
  const { showToast } = useToast();
  
  // Use our new hooks
  const {
    todayAppointments,
    weekAppointments,
    monthAppointments,
    pendingAppointments,
    loading: appointmentsLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
    fetchAppointments,
  } = useAppointments();

  const {
    customers,
    loading: customersLoading,
    createCustomer,
    fetchCustomers,
  } = useCustomers();

  // Local state
  const [currentFilter, setCurrentFilter] = useState<"today" | "week" | "month" | "all" | "pending">("today");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Modal management
  const appointmentFormModal = useModal();
  const appointmentViewModal = useModal();
  const customerModal = useModal();
  const confirmModal = useModal();
  const newCustomerModal = useModal();
  
  // Estados para datos de modals
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [confirmData, setConfirmData] = useState<any>(null);

  // Get filtered appointments based on current filter
  const getFilteredAppointments = () => {
    switch (currentFilter) {
      case "today":
        return todayAppointments;
      case "week":
        return weekAppointments;
      case "month":
        return monthAppointments;
      case "pending":
        return pendingAppointments;
      default:
        return todayAppointments; // Default to today for "all"
    }
  };

  // Search and pagination
  const filteredAppointments = getFilteredAppointments();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Simple search filter
  const searchedAppointments = filteredAppointments.filter((appointment) =>
    appointment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(searchedAppointments.length / APPOINTMENTS_PER_PAGE);
  const paginatedAppointments = searchedAppointments.slice(
    (currentPage - 1) * APPOINTMENTS_PER_PAGE,
    currentPage * APPOINTMENTS_PER_PAGE
  );

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAppointments(),
          fetchCustomers()
        ]);
      } catch (error) {
        console.error('Error loading appointments data:', error);
        showToast({ title: 'Error al cargar los datos', type: 'error' });
      }
    };

    loadData();
  }, [fetchAppointments, fetchCustomers]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter, searchTerm]);

  // Event handlers
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

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      showToast({ title: 'Cita eliminada exitosamente', type: 'success' });
      confirmModal.closeModal();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToast({ title: 'Error al eliminar la cita', type: 'error' });
    }
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateStatus(id, status);
      showToast({ title: 'Estado actualizado exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      showToast({ title: 'Error al actualizar el estado', type: 'error' });
    }
  };

  const handleCreateCustomer = async (data: any) => {
    try {
      await createCustomer(data);
      showToast({ title: 'Cliente creado exitosamente', type: 'success' });
      newCustomerModal.closeModal();
      await fetchCustomers(); // Refresh customers list
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast({ title: 'Error al crear el cliente', type: 'error' });
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    appointmentFormModal.openModal();
  };

  const handleDeleteClick = (appointment: any) => {
    setConfirmData({
      title: "Eliminar Cita",
      message: `¿Estás seguro de que deseas eliminar la cita con ${appointment.customer.name}?`,
      onConfirm: () => handleDeleteAppointment(appointment.id),
    });
    confirmModal.openModal();
  };

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    customerModal.openModal();
  };

  const getFilterStats = () => {
    return {
      today: todayAppointments.length,
      week: weekAppointments.length,
      month: monthAppointments.length,
      pending: pendingAppointments.length,
      all: todayAppointments.length, // Assuming "all" means today's appointments
    };
  };

  const getFilterLabel = () => {
    switch (currentFilter) {
      case "today":
        return "Hoy";
      case "week":
        return "Esta Semana";
      case "month":
        return "Este Mes";
      case "pending":
        return "Pendientes";
      default:
        return "Todas";
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

  const filterStats = getFilterStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <ContentContainer>
        <PageHeader
          title="Gestión de Citas"
          description="Administra y programa las citas de tus clientes"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Hoy"
            value={filterStats.today}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="Esta Semana"
            value={filterStats.week}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Este Mes"
            value={filterStats.month}
            icon={Calendar}
            color="purple"
          />
          <StatsCard
            title="Pendientes"
            value={filterStats.pending}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Total"
            value={filterStats.all}
            icon={Calendar}
            color="blue"
          />
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filtrar:</span>
              {(["today", "week", "month", "pending", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentFilter === filter
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter === "today" ? "Hoy" : 
                   filter === "week" ? "Semana" :
                   filter === "month" ? "Mes" :
                   filter === "pending" ? "Pendientes" : "Todas"}
                  <span className="ml-1 px-1.5 py-0.5 bg-white rounded text-xs">
                    {filterStats[filter]}
                  </span>
                </button>
              ))}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 rounded-lg ${
                    viewMode === "calendar" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  appointmentFormModal.openModal();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Cita
              </button>

              <button
                onClick={() => newCustomerModal.openModal()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar citas por cliente o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Current Filter Display */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Citas: {getFilterLabel()}
            {searchTerm && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (filtrado por &ldquo;{searchTerm}&rdquo;)
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            Mostrando {searchedAppointments.length} cita{searchedAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {paginatedAppointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={searchTerm ? "No se encontraron citas" : "No hay citas"}
                description={
                  searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : `No tienes citas ${getFilterLabel().toLowerCase()}`
                }
                onAction={() => appointmentFormModal.openModal()}
              />
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4">
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        appointmentViewModal.openModal();
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {(currentPage - 1) * APPOINTMENTS_PER_PAGE + 1} - {Math.min(currentPage * APPOINTMENTS_PER_PAGE, searchedAppointments.length)} de {searchedAppointments.length} citas
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ContentContainer>

      {/* Modals */}
      
      {/* Appointment Form Modal (Create/Edit) */}
      <BaseModal
        isOpen={appointmentFormModal.isOpen}
        onClose={appointmentFormModal.closeModal}
        title={selectedAppointment ? "Editar Cita" : "Nueva Cita"}
        size="lg"
      >
        <AppointmentForm
          appointment={selectedAppointment}
          customers={customers}
          onSubmit={selectedAppointment ? 
            (data) => handleUpdateAppointment(selectedAppointment.id, data) :
            handleCreateAppointment
          }
          onCancel={appointmentFormModal.closeModal}
          mode={selectedAppointment ? 'edit' : 'create'}
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
        onDelete={(appointment) => handleDeleteClick(appointment)}
        onCustomerClick={(customerId) => {
          const customer = customers.find(c => c.id === customerId);
          if (customer) handleCustomerClick(customer);
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={customerModal.closeModal}
        customer={selectedCustomer}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        title={confirmData?.title || "Confirmar acción"}
        message={confirmData?.message || "¿Estás seguro?"}
        onConfirm={confirmData?.onConfirm || (() => {})}
      />

      {/* New Customer Modal */}
      <BaseModal
        isOpen={newCustomerModal.isOpen}
        onClose={newCustomerModal.closeModal}
        title="Nuevo Cliente"
        size="md"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={newCustomerModal.closeModal}
        />
      </BaseModal>
    </div>
  );
}
