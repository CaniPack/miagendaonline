"use client";

import React from "react";
import { Calendar, Clock, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils/formatters";
import { getStatusColor, getStatusText } from "@/lib/utils/status";
import type { AppointmentCardProps } from "@/types";

const AppointmentCard = React.memo<AppointmentCardProps>(({
  appointment,
  onClick,
  showCustomer = true,
  compact = false,
}) => {
  const statusColor = React.useMemo(() => getStatusColor(appointment.status), [appointment.status]);
  const statusText = React.useMemo(() => getStatusText(appointment.status), [appointment.status]);

  const cardContent = React.useMemo(() => (
    <>
      {/* Header con estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {showCustomer ? appointment.customer.name : "Cita"}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(appointment.date)} • {formatTime(appointment.date)}
            </p>
          </div>
        </div>
        
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
          statusColor
        )}>
          {statusText}
        </span>
      </div>

      {/* Detalles de la cita */}
      <div className="space-y-2">
        {/* Duración */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{appointment.duration} minutos</span>
        </div>

        {/* Precios (si existen) */}
        {(appointment.publicPrice || appointment.internalPrice) && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <div className="flex space-x-2">
              {appointment.publicPrice && (
                <span className="text-green-600 font-medium">
                  {formatCurrency(appointment.publicPrice)}
                </span>
              )}
              {appointment.internalPrice && appointment.internalPrice !== appointment.publicPrice && (
                <span className="text-gray-500">
                  (Interno: {formatCurrency(appointment.internalPrice)})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas del cliente */}
      {!compact && appointment.notes && (
        <div className="flex items-start space-x-2 text-sm text-gray-600">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{appointment.notes}</p>
        </div>
      )}

      {/* Comentario interno (si existe) */}
      {!compact && appointment.internalComment && (
        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-200 rounded-r">
          <p className="text-xs text-yellow-800">
            <strong>Nota interna:</strong> {appointment.internalComment}
          </p>
        </div>
      )}
    </>
  ), [appointment, showCustomer, compact, statusColor, statusText]);

  const baseClasses = React.useMemo(() => cn(
    "bg-white border border-gray-200 rounded-lg transition-all duration-200",
    compact ? "p-3" : "p-4",
    onClick && "cursor-pointer hover:shadow-md hover:border-blue-300",
  ), [compact, onClick]);

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(appointment);
    }
  }, [onClick, appointment]);

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

AppointmentCard.displayName = 'AppointmentCard';

export default AppointmentCard;

// Variante para lista de citas del día
export function TodayAppointmentCard({
  appointment,
  onClick,
}: Pick<AppointmentCardProps, "appointment" | "onClick">) {
  const statusColor = getStatusColor(appointment.status);
  
  return (
    <div 
      className={cn(
        "flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-300"
      )}
      onClick={() => onClick?.(appointment)}
    >
      {/* Status indicator */}
      <div className={cn(
        "w-3 h-3 rounded-full",
        appointment.status === "COMPLETED" ? "bg-green-500" :
        appointment.status === "CONFIRMED" ? "bg-blue-500" :
        appointment.status === "PENDING" ? "bg-yellow-500" : "bg-red-500"
      )} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {appointment.customer.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatTime(appointment.date)}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            {appointment.duration} minutos
          </p>
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
            statusColor
          )}>
            {getStatusText(appointment.status)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Variante para calendario (punto/indicador)
export function CalendarAppointmentDot({
  appointment,
  onClick,
  size = "sm",
}: Pick<AppointmentCardProps, "appointment" | "onClick"> & {
  size?: "sm" | "md";
}) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
  };
  
  const statusColors = {
    PENDING: "bg-yellow-500",
    CONFIRMED: "bg-blue-500", 
    CANCELLED: "bg-red-500",
    COMPLETED: "bg-green-500",
  };

  return (
    <div
      className={cn(
        "rounded-full border-2 border-white shadow-sm",
        sizeClasses[size],
        statusColors[appointment.status as keyof typeof statusColors] || "bg-gray-500",
        onClick && "cursor-pointer hover:scale-110 transition-transform"
      )}
      onClick={() => onClick?.(appointment)}
      title={`${formatTime(appointment.date)} - ${appointment.customer.name}`}
    />
  );
}

// Variante de loading skeleton
export function LoadingAppointmentCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg animate-pulse",
      compact ? "p-3" : "p-4"
    )}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
      </div>

      {/* Customer info skeleton */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        {!compact && (
          <div className="ml-6 space-y-1">
            <div className="w-24 h-3 bg-gray-100 rounded"></div>
            <div className="w-28 h-3 bg-gray-100 rounded"></div>
          </div>
        )}
      </div>

      {/* Duration and price skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-12 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
          </div>
    );
  } 