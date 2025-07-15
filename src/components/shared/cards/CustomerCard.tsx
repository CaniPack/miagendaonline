"use client";

import React from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  formatCurrency, 
  formatDate,
  formatTimeAgo,
} from "@/lib/utils/formatters";
import { getCustomerStatus } from "@/lib/utils/calculators";
import type { CustomerCardProps } from "@/types";

const CustomerCard = React.memo<CustomerCardProps>(({
  customer,
  onClick,
  onEdit,
  onDelete,
  onWhatsApp,
  showMetrics = true,
  compact = false,
  showActions = false,
}) => {
  const customerStatus = React.useMemo(() => getCustomerStatus(customer), [customer]);
  
  const cardContent = React.useMemo(() => (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {customer.name}
            </h3>
            {!compact && (
              <p className="text-xs text-gray-500">
                Cliente desde {formatDate(customer.createdAt)}
              </p>
            )}
          </div>
        </div>
        
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
          customerStatus.color
        )}>
          {customerStatus.status}
        </span>
      </div>

      {/* Información de contacto */}
      {!compact && (
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Métricas del cliente */}
      {showMetrics && !compact && (
        <div className="grid grid-cols-2 gap-2 text-center">
          {/* Total de citas */}
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Citas</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {customer._count?.appointments || customer.appointments?.length || 0}
            </p>
          </div>

          {/* Ingresos totales */}
          {customer.totalIncome && (
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(customer.totalIncome)}
              </p>
            </div>
          )}

          {/* Promedio mensual */}
          {!compact && customer.averageAppointmentsPerMonth && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Promedio</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {customer.averageAppointmentsPerMonth}/mes
              </p>
            </div>
          )}

          {/* Última cita */}
          {!compact && customer.lastAppointment && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Última</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatTimeAgo(customer.lastAppointment)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !compact && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          {customer.phone && onWhatsApp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWhatsApp(customer);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(customer);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Editar
            </button>
          )}
        </div>
      )}
    </>
  ), [customer, compact, showMetrics, customerStatus, showActions, onEdit, onWhatsApp]);

  const baseClasses = React.useMemo(() => cn(
    "bg-white border border-gray-200 rounded-lg transition-all duration-200",
    compact ? "p-3" : "p-4",
    onClick && "cursor-pointer hover:shadow-md hover:border-blue-300",
  ), [compact, onClick]);

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(customer);
    }
  }, [onClick, customer]);

  if (onClick) {
    return (
      <button className={baseClasses} onClick={handleClick}>
        {cardContent}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;

// Variante para lista simple
export function SimpleCustomerCard({
  customer,
  onClick,
}: Pick<CustomerCardProps, "customer" | "onClick">) {
  const customerStatus = getCustomerStatus(customer);
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-300"
      )}
      onClick={() => onClick?.(customer)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
          <p className="text-xs text-gray-500">
            {customer._count?.appointments || 0} citas
          </p>
        </div>
      </div>
      
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
        customerStatus.color
      )}>
        {customerStatus.status}
      </span>
    </div>
  );
}

// Variante para métricas en dashboard
export const CustomerMetricCard = React.memo<Pick<CustomerCardProps, "customer" | "onClick"> & {
  highlightMetric?: "income" | "appointments" | "frequency";
}>(({
  customer,
  onClick,
  highlightMetric = "income",
}) => {
  const getHighlightValue = React.useCallback(() => {
    switch (highlightMetric) {
      case "income":
        return customer.totalIncome ? formatCurrency(customer.totalIncome) : "$0";
      case "appointments": 
        return customer._count?.appointments || customer.appointments?.length || 0;
      case "frequency":
        return customer.averageAppointmentsPerMonth ? 
          `${customer.averageAppointmentsPerMonth}/mes` : "0/mes";
      default:
        return "";
    }
  }, [customer, highlightMetric]);

  const getMetricIcon = React.useCallback(() => {
    switch (highlightMetric) {
      case "income":
        return DollarSign;
      case "appointments":
        return Calendar;
      case "frequency":
        return TrendingUp;
      default:
        return Users;
    }
  }, [highlightMetric]);

  const MetricIcon = getMetricIcon();
  const highlightValue = getHighlightValue();

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(customer);
    }
  }, [onClick, customer]);

  return (
    <div 
      className={cn(
        "flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-300"
      )}
      onClick={handleClick}
    >
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="h-5 w-5 text-blue-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {customer.name}
        </p>
        <div className="flex items-center space-x-1 mt-1">
          <MetricIcon className="h-3 w-3 text-gray-400" />
          <p className="text-xs text-gray-500">
            {highlightValue}
          </p>
        </div>
      </div>
      
      {customer.lastAppointment && (
        <div className="text-right">
          <p className="text-xs text-gray-500">Última cita</p>
          <p className="text-xs font-medium text-gray-900">
            {formatTimeAgo(customer.lastAppointment)}
          </p>
        </div>
      )}
    </div>
  );
});

CustomerMetricCard.displayName = 'CustomerMetricCard';

// Variante de loading skeleton
export function LoadingCustomerCard({ 
  compact = false, 
  showMetrics = true 
}: { 
  compact?: boolean;
  showMetrics?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg animate-pulse",
      compact ? "p-3" : "p-4"
    )}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
            {!compact && <div className="w-20 h-3 bg-gray-100 rounded"></div>}
          </div>
        </div>
        <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
      </div>

      {/* Contact info skeleton */}
      {!compact && (
        <div className="space-y-1 mb-3">
          <div className="w-28 h-3 bg-gray-100 rounded"></div>
          <div className="w-32 h-3 bg-gray-100 rounded"></div>
        </div>
      )}

      {/* Metrics skeleton */}
      {showMetrics && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="w-12 h-3 bg-gray-200 rounded mb-1 mx-auto"></div>
            <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="w-12 h-3 bg-gray-200 rounded mb-1 mx-auto"></div>
            <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
} 