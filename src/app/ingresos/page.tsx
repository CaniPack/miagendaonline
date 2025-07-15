"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { PageHeader, ContentContainer } from "@/components/shared/layout";
import { BaseModal } from "@/components/shared/modals";
import { LoadingSpinner } from "@/components/shared";
import { IncomeStatsCards, ClientMetricsTable, AppointmentIncomeList } from "@/components/income";
import { useIncome } from "@/hooks";
import {
  BarChartIcon,
  CreditCardIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  ClockIcon,
} from "lucide-react";

export default function IngresosPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'clients'>('overview');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const {
    incomeData,
    appointmentIncomes,
    clientMetrics,
    loading,
    error,
    refresh,
  } = useIncome();

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const handleClientClick = async (clientId: string) => {
    // Buscar el cliente en los datos de métricas
    const customer = clientMetrics.find(c => c.id === clientId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  const handleCustomerClickByName = async (customerName: string) => {
    // Buscar cliente por nombre en las métricas
    const customer = clientMetrics.find(c => 
      c.name.toLowerCase().includes(customerName.toLowerCase())
    );
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
  };

  // Funciones de utilidad simples
  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount ?? 0;
    return `$${safeAmount.toLocaleString('es-CO')}`;
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES');
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('es-ES');
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getCustomerStatus = (customer: any) => {
    if (!customer) return { color: 'gray', text: 'Desconocido' };
    
    switch (customer.status) {
      case 'active':
        return { color: 'green', text: 'Activo' };
      case 'inactive':
        return { color: 'yellow', text: 'Inactivo' };
      case 'new':
        return { color: 'blue', text: 'Nuevo' };
      default:
        return { color: 'gray', text: 'Desconocido' };
    }
  };

  const getSortedAppointments = () => {
    return [...appointmentIncomes].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  if (loading && !incomeData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <ContentContainer>
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </ContentContainer>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <IncomeStatsCards
        incomeData={incomeData}
        formatCurrency={formatCurrency}
      />
      
      {incomeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2 text-blue-600" />
              Resumen Mensual
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ingresos este mes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(incomeData.totalThisMonth)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Crecimiento</p>
                  <p className={`text-lg font-semibold ${
                    (incomeData.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(incomeData.growth ?? 0) >= 0 ? '+' : ''}{(incomeData.growth ?? 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Mes anterior</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(incomeData.totalLastMonth)}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Promedio mensual</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCurrency(incomeData.monthlyAverage)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-green-600" />
              Citas Recientes
            </h3>
            <div className="space-y-3">
              {appointmentIncomes?.slice(0, 5).map((appointment: any) => (
                <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.customer?.name || 'Cliente desconocido'}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(appointment.date)}</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(appointment.income)}
                  </span>
                </div>
              ))}
              {(!appointmentIncomes || appointmentIncomes.length === 0) && (
                <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <AppointmentIncomeList
      appointments={getSortedAppointments()}
      loading={loading}
      formatCurrency={formatCurrency}
      formatDateTime={formatDateTime}
      formatTime={formatTime}
      onCustomerClick={handleCustomerClickByName}
    />
  );

  const renderClients = () => (
                <ClientMetricsTable
              clientMetrics={clientMetrics}
              loading={loading}
              formatCurrency={formatCurrency}
              onClientClick={handleClientClick}
            />
  );

  const renderCustomerModal = () => {
    if (!selectedCustomer) return null;

    const status = getCustomerStatus(selectedCustomer);
    
    // Estadísticas simplificadas del cliente
    const serviceStats = {
      totalAppointments: selectedCustomer.appointmentCount || 0,
      totalIncome: selectedCustomer.totalIncome || 0,
      averagePerAppointment: selectedCustomer.averagePerAppointment || 0,
      averageDuration: 60, // Duración promedio fija de 60 minutos
    };

         return (
       <BaseModal
         isOpen={showCustomerModal}
         onClose={closeCustomerModal}
         title="Detalles del Cliente"
         size="lg"
       >
        <div className="space-y-6">
          {/* Customer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCustomer.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  {selectedCustomer.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MailIcon className="h-4 w-4 mr-1" />
                      {selectedCustomer.email}
                    </div>
                  )}
                  {selectedCustomer.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {selectedCustomer.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
              {status.text}
            </span>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedCustomer.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Total Citas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCustomer.appointments.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Última Cita</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedCustomer.lastAppointment)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Estadísticas de Servicio
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Promedio citas/mes:</span>
                <span className="ml-2 font-medium">
                  {selectedCustomer.averageAppointmentsPerMonth.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Duración promedio:</span>
                <span className="ml-2 font-medium">
                  {serviceStats.averageDuration.toFixed(0)} min
                </span>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Historial de Citas (últimas 5)
            </h4>
            <div className="space-y-2">
              {selectedCustomer.appointments
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((appointment: any) => (
                  <div key={appointment.id} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(appointment.date)}
                      </div>
                      {appointment.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(appointment.internalPrice || 50000)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.duration} min
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
             </BaseModal>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <ContentContainer>
        <PageHeader
          title="Ingresos y Reportes"
          description="Analiza tus ingresos y métricas de clientes"
          icon={<CreditCardIcon className="h-6 w-6" />}
        />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Historial
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`${
                  activeTab === 'clients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Métricas por Cliente
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'clients' && renderClients()}
        </div>

        {/* Customer Details Modal */}
        {renderCustomerModal()}
      </ContentContainer>
    </div>
  );
}
