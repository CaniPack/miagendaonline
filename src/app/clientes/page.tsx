"use client";

import { useState, useEffect } from "react";
import { User, Plus, Search, Download } from "lucide-react";

// Import our new components and hooks
import {
  StatsCard,
  CustomerCard,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  ContentContainer,
} from "@/components/shared";
import {
  CustomerModal,
  ConfirmModal,
  useModal,
} from "@/components/shared/modals";
import {
  CustomerForm,
} from "@/components/shared/forms";
import {
  useCustomers,
  useAppointments,
} from "@/hooks";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ToastProvider";
import WhatsAppNotifications from "@/components/WhatsAppNotifications";

const CUSTOMERS_PER_PAGE = 12;

export default function ClientesPage() {
  const { showToast } = useToast();
  
  // Use our new hooks
  const {
    customers,
    loading: customersLoading,
    activeCustomers,
    inactiveCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers,
  } = useCustomers();

  const {
    loading: appointmentsLoading,
    fetchAppointments,
  } = useAppointments();

  // Local state for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField] = useState<'name' | 'email' | 'phone' | 'lastAppointment'>('name');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal management
  const customerModal = useModal();
  const confirmModal = useModal();
  const newCustomerModal = useModal();
  
  // WhatsApp modal state
  const [whatsappModal, setWhatsappModal] = useState({
    isOpen: false,
    customer: null as any,
  });

  // Get filtered customers based on current filters
  const getFilteredCustomers = () => {
    let filtered = customers;

    // Filter by status
    if (filterStatus === "active") {
      filtered = activeCustomers;
    } else if (filterStatus === "inactive") {
      filtered = inactiveCustomers;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort customers
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case "phone":
          aValue = a.phone?.toLowerCase() || '';
          bValue = b.phone?.toLowerCase() || '';
          break;
        case "lastAppointment":
          aValue = a.lastAppointment ? new Date(a.lastAppointment).getTime() : 0;
          bValue = b.lastAppointment ? new Date(b.lastAppointment).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * CUSTOMERS_PER_PAGE,
    currentPage * CUSTOMERS_PER_PAGE
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
        console.error('Error loading clients data:', error);
        showToast('Error al cargar los datos', 'error');
      }
    };

    loadData();
  }, [fetchAppointments, fetchCustomers, showToast]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortField, sortDirection]);

  // Event handlers
  const handleCreateCustomer = async (data: any) => {
    try {
      await createCustomer(data);
      showToast('Cliente creado exitosamente', 'success');
      customerModal.closeModal();
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast('Error al crear el cliente', 'error');
    }
  };

  const handleUpdateCustomer = async (id: string, data: any) => {
    try {
      await updateCustomer(id, data);
      showToast('Cliente actualizado exitosamente', 'success');
      customerModal.closeModal();
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast('Error al actualizar el cliente', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }
    
    try {
      await deleteCustomer(id);
      showToast('Cliente eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Error al eliminar el cliente', 'error');
    }
  };

  const handleEditCustomer = (customer: any) => {
    customerModal.openModal(customer);
  };

  const handleDeleteClick = (customer: any) => {
    confirmModal.openModal({
      title: "Eliminar Cliente",
      message: `¿Estás seguro de que deseas eliminar a ${customer.name}? Esta acción no se puede deshacer.`,
      onConfirm: () => handleDeleteCustomer(customer.id),
    });
  };

  const handleWhatsApp = (customer: any) => {
    setWhatsappModal({
      isOpen: true,
      customer: customer,
    });
  };

  const handleWhatsAppClose = () => {
    setWhatsappModal({
      isOpen: false,
      customer: null,
    });
  };

  const handleWhatsAppSuccess = () => {
    showToast('Mensaje de WhatsApp enviado exitosamente!', 'success');
    handleWhatsAppClose();
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportCustomers = () => {
    // Simple CSV export
    const headers = ['Nombre', 'Email', 'Teléfono', 'Fecha Registro', 'Total Citas', 'Ingresos Totales'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        `"${customer.name}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${new Date(customer.createdAt).toLocaleDateString()}"`,
        customer._count?.appointments || 0,
        customer.totalIncome || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Archivo CSV exportado exitosamente', 'success');
  };

  // Get statistics
  const getStats = () => {
    return {
      total: customers.length,
      active: activeCustomers?.length || 0,
      inactive: inactiveCustomers?.length || 0,
      thisMonth: customers.filter(c => {
        const created = new Date(c.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
    };
  };

  // Loading state
  if (customersLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const customerStats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <ContentContainer>
        <PageHeader
          title="Gestión de Clientes"
          description="Administra tu base de clientes y su información"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          <StatsCard
            title="Total Clientes"
            value={customerStats.total}
            icon={User}
            color="blue"
          />
          <StatsCard
            title="Clientes Activos"
            value={customerStats.active}
            icon={User}
            color="green"
          />
          <StatsCard
            title="Clientes Inactivos"
            value={customerStats.inactive}
            icon={User}
            color="red"
          />
          <StatsCard
            title="Nuevos Este Mes"
            value={customerStats.thisMonth}
            icon={User}
            color="purple"
          />
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos ({customerStats.total})</option>
                  <option value="active">Activos ({customerStats.active})</option>
                  <option value="inactive">Inactivos ({customerStats.inactive})</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Ordenar:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field as any);
                    setSortDirection(direction as any);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name-asc">Nombre A-Z</option>
                  <option value="name-desc">Nombre Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                  <option value="phone-asc">Teléfono A-Z</option>
                  <option value="phone-desc">Teléfono Z-A</option>
                  <option value="lastAppointment-desc">Última Cita Más Reciente</option>
                  <option value="lastAppointment-asc">Última Cita Más Antigua</option>
                </select>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={exportCustomers}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>

              <button
                onClick={() => newCustomerModal.openModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
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
                placeholder="Buscar clientes por nombre, email o teléfono..."
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
            Clientes: {filterStatus === "all" ? "Todos" : filterStatus === "active" ? "Activos" : "Inactivos"}
            {searchTerm && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (filtrado por "{searchTerm}")
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            Mostrando {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Customers Grid */}
        <div className="bg-white rounded-xl shadow-sm border">
          {paginatedCustomers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={searchTerm ? "No se encontraron clientes" : "No hay clientes"}
                description={
                  searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza agregando tu primer cliente"
                }
                actionText="Nuevo Cliente"
                onAction={() => newCustomerModal.openModal()}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {paginatedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onClick={() => handleEditCustomer(customer)}
                    onEdit={() => handleEditCustomer(customer)}
                    onDelete={() => handleDeleteClick(customer)}
                    onWhatsApp={() => handleWhatsApp(customer)}
                    showActions
                    showStats
                    showContactInfo
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {(currentPage - 1) * CUSTOMERS_PER_PAGE + 1} - {Math.min(currentPage * CUSTOMERS_PER_PAGE, filteredCustomers.length)} de {filteredCustomers.length} clientes
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

        {/* Top Customers Section */}
        {/* The original code had topCustomers, but it's not defined.
            Assuming it's meant to be filteredCustomers or a subset.
            For now, removing the section as it's not directly related to the current filters. */}
        {/*
        {topCustomers.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mejores Clientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCustomers.slice(0, 6).map((customer, index) => (
                <div
                  key={customer.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer._count?.appointments || 0} citas • ${customer.totalIncome || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        */}
      </ContentContainer>

      {/* Modals */}
      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={customerModal.closeModal}
        customer={customerModal.data}
        onSave={customerModal.data ? 
          (data) => handleUpdateCustomer(customerModal.data.id, data) :
          handleCreateCustomer
        }
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        title={confirmModal.data?.title}
        message={confirmModal.data?.message}
        onConfirm={confirmModal.data?.onConfirm}
      />

      {/* New Customer Modal */}
      <div className={`${newCustomerModal.isOpen ? 'block' : 'hidden'}`}>
        {/* Overlay clickeable con efecto blur sutil */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={newCustomerModal.closeModal}
        >
          {/* Modal content - detener propagación del click */}
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Nuevo Cliente</h3>
            <CustomerForm
              onSubmit={handleCreateCustomer}
              onCancel={newCustomerModal.closeModal}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppNotifications
        customer={whatsappModal.customer}
        isOpen={whatsappModal.isOpen}
        onClose={handleWhatsAppClose}
        onSuccess={handleWhatsAppSuccess}
      />
    </div>
  );
}
