"use client";

import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";
import { ClientMetrics } from '@/hooks/useIncome';

interface ClientMetricsTableProps {
  clientMetrics: ClientMetrics[];
  loading?: boolean;
  formatCurrency: (amount: number) => string;
  onClientClick: (clientId: string) => void;
}

const TrendIcon = React.memo<{ trend: number }>(({ trend }) => {
  if (trend > 0) {
    return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
  } else if (trend < 0) {
    return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
  } else {
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  }
});
TrendIcon.displayName = 'TrendIcon';

const ClientRow = React.memo<{
  client: ClientMetrics;
  formatCurrency: (amount: number) => string;
  onClientClick: (clientId: string) => void;
}>(({ client, formatCurrency, onClientClick }) => {
  const handleClick = React.useCallback(() => {
    onClientClick(client.id);
  }, [onClientClick, client.id]);

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {client.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(client.totalIncome)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {client.appointmentCount}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatCurrency(client.averagePerAppointment)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {client.averageAppointmentsPerMonth.toFixed(1)} citas/mes
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-1">
          <TrendIcon trend={client.growthTrend === 'up' ? 1 : client.growthTrend === 'down' ? -1 : 0} />
          <span className={`text-sm font-medium ${
            client.growthTrend === 'up' ? 'text-green-600' : 
            client.growthTrend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {client.growthTrend === 'up' ? 'Subiendo' : 
             client.growthTrend === 'down' ? 'Bajando' : 'Estable'}
          </span>
        </div>
      </td>
    </tr>
  );
});
ClientRow.displayName = 'ClientRow';

const LoadingSkeleton = React.memo(() => (
  <div className="animate-pulse">
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

export const ClientMetricsTable = React.memo<ClientMetricsTableProps>(({
  clientMetrics,
  loading = false,
  formatCurrency,
  onClientClick,
}) => {
  const tableHeaders = React.useMemo(() => [
    { key: 'name', label: 'Cliente' },
    { key: 'totalIncome', label: 'Ingresos Totales' },
    { key: 'appointmentCount', label: 'Citas' },
    { key: 'averagePerAppointment', label: 'Promedio por Cita' },
    { key: 'averageAppointmentsPerMonth', label: 'Frecuencia' },
    { key: 'growthTrend', label: 'Tendencia' },
  ], []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!clientMetrics || clientMetrics.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay métricas de clientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Las métricas aparecerán cuando tengas citas con ingresos registrados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TrendingUpIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            Métricas por Cliente
          </h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientMetrics.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                formatCurrency={formatCurrency}
                onClientClick={onClientClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ClientMetricsTable.displayName = 'ClientMetricsTable'; 